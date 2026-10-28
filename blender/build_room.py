"""Build the Pocket Room diorama and render its layers.

Run: blender -b --python blender/build_room.py -- [--no-render]

An isometric, Monument Valley style cutaway room with toon (3渲2) shading:
Diffuse -> Shader to RGB -> constant colour ramp, plus Freestyle outlines.
The shell (floor, walls, sofa, rug, table) renders once per palette; each
collectable item renders alone on the same camera, so the app can stack
transparent PNGs. Writes assets/room/*.png, manifest.json and pocket_room.blend.
"""
import bpy, bmesh, json, math, sys
from mathutils import Vector
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'room'
OUT.mkdir(parents=True, exist_ok=True)
RENDER = '--no-render' not in sys.argv
QUICK = '--quick' in sys.argv  # shell only, for composition checks
SIZE = 1200

# ---------- scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = scene.render.resolution_y = SIZE
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.quality = 92
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.eevee.taa_render_samples = 32
world = bpy.data.worlds.new('World'); scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35

# Freestyle outlines: soft plum, silhouettes and hard creases only
scene.render.use_freestyle = True
scene.render.line_thickness_mode = 'ABSOLUTE'
scene.render.line_thickness = 1.6
ls = scene.view_layers[0].freestyle_settings.linesets[0] if scene.view_layers[0].freestyle_settings.linesets else scene.view_layers[0].freestyle_settings.linesets.new('Lines')
ls.select_by_visibility = True
ls.select_by_face_marks = True
ls.face_mark_negation = 'EXCLUSIVE'
ls.face_mark_condition = 'ONE'
ls.select_silhouette = ls.select_border = ls.select_crease = True
scene.view_layers[0].freestyle_settings.crease_angle = math.radians(140)
if ls.linestyle is None:
    ls.linestyle = bpy.data.linestyles.new('Outline')
ls.linestyle.color = (0.24, 0.17, 0.25)
ls.linestyle.alpha = 0.55
ls.linestyle.thickness = 1.6

# Monument Valley camera: true isometric orthographic
cam_data = bpy.data.cameras.new('Iso'); cam_data.type = 'ORTHO'; cam_data.ortho_scale = 7.1
cam = bpy.data.objects.new('Iso', cam_data); scene.collection.objects.link(cam); scene.camera = cam
cam.rotation_euler = (math.radians(54.7356), 0, math.radians(45))
TARGET = Vector((0, 0, 1.3))
forward = cam.rotation_euler.to_matrix() @ Vector((0, 0, -1))
cam.location = TARGET - forward * 30
cam_data.clip_end = 100

sun_data = bpy.data.lights.new('Sun', 'SUN'); sun_data.energy = 3.2; sun_data.angle = math.radians(2)
sun = bpy.data.objects.new('Sun', sun_data); scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(42), 0, math.radians(28))  # from front-right, shadows fall back-left onto the walls

# ---------- toon material ----------
def hexrgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1,)

SHADOW = hexrgb('#8f7fb0')  # lavender shadow tint, multiplied into every colour
mats = {}
def toon(name, color):
    if name in mats:
        return mats[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; n = nt.nodes; n.clear()
    dif = n.new('ShaderNodeBsdfDiffuse')
    rgb = n.new('ShaderNodeShaderToRGB')
    ramp = n.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, (0.0, 0, 0, 1)
    e[1].position, e[1].color = 0.12, (0.55, 0, 0, 1)
    e.new(0.42).color = (1.0, 0, 0, 1)
    sep = n.new('ShaderNodeSeparateColor')
    shade = n.new('ShaderNodeMix'); shade.data_type = 'RGBA'
    shade.inputs['A'].default_value = tuple(c * s for c, s in zip(hexrgb(color), SHADOW))
    shade.inputs['B'].default_value = hexrgb(color)
    em = n.new('ShaderNodeEmission'); out = n.new('ShaderNodeOutputMaterial')
    l = nt.links
    l.new(dif.outputs[0], rgb.inputs[0]); l.new(rgb.outputs['Color'], ramp.inputs['Fac'])
    l.new(ramp.outputs['Color'], sep.inputs[0]); l.new(sep.outputs['Red'], shade.inputs['Factor'])
    l.new(shade.outputs['Result'], em.inputs['Color']); l.new(em.outputs[0], out.inputs[0])
    m['base'] = color
    mats[name] = m
    return m

def flat(name, color, alpha=1.0):
    """Unlit colour, for blob shadows and glowing bits."""
    m = bpy.data.materials.new(name); m.use_nodes = True
    n = m.node_tree.nodes; n.clear()
    em = n.new('ShaderNodeEmission'); em.inputs['Color'].default_value = hexrgb(color)
    out = n.new('ShaderNodeOutputMaterial')
    if alpha < 1:
        tr = n.new('ShaderNodeBsdfTransparent'); mix = n.new('ShaderNodeMixShader')
        mix.inputs['Fac'].default_value = alpha
        m.node_tree.links.new(tr.outputs[0], mix.inputs[1]); m.node_tree.links.new(em.outputs[0], mix.inputs[2])
        m.node_tree.links.new(mix.outputs[0], out.inputs[0])
        m.surface_render_method = 'BLENDED'
    else:
        m.node_tree.links.new(em.outputs[0], out.inputs[0])
    return m

# ---------- geometry helpers ----------
coll = {}
def collection(name):
    c = bpy.data.collections.new(name); scene.collection.children.link(c); coll[name] = c; return c

current = None
def put(obj, mat, bevel=0.0, segs=3, smooth=False, lines=True):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    current.objects.link(obj)
    obj.data.materials.clear(); obj.data.materials.append(mat)
    if bevel:
        b = obj.modifiers.new('Bevel', 'BEVEL'); b.width = bevel; b.segments = segs; b.limit_method = 'ANGLE'
    if smooth:
        obj.data.shade_smooth()
    if not lines:  # face-marked faces are excluded from the outline lineset
        a = obj.data.attributes.new('freestyle_face', 'BOOLEAN', 'FACE')
        a.data.foreach_set('value', [True] * len(obj.data.polygons))
        obj.visible_shadow = False
    return obj

def box(name, size, loc, mat, bevel=0.03, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.location, o.rotation_euler = loc, rot
    return put(o, mat, bevel)

def cyl(name, r, h, loc, mat, verts=32, bevel=0.02, r2=None, rot=(0, 0, 0)):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=h, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    return put(o, mat, bevel, smooth=True)

def ball(name, r, loc, mat, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=r)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.location = loc
    return put(o, mat, smooth=True)

def blob(name, rx, ry, loc):
    """Soft contact shadow baked into each item, since items render without the floor."""
    bpy.ops.mesh.primitive_circle_add(vertices=40, radius=1, fill_type='NGON')
    o = bpy.context.object; o.name = name; o.scale = (rx, ry, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.location = (loc[0], loc[1], 0.075)
    o.visible_shadow = False
    return put(o, SHADOW_MAT, lines=False)

def cut(target, cutter):
    m = target.modifiers.new('Cut', 'BOOLEAN'); m.object = cutter; m.operation = 'DIFFERENCE'
    cutter.hide_render = True; cutter.hide_viewport = True
    cutter.display_type = 'WIRE'

SHADOW_MAT = flat('blob', '#6b5a86', 0.22)

# ---------- palettes ----------
PALETTES = {
    'oat':  dict(wall='#f6e3c8', wall2='#efd3ad', trim='#fff6e8', floor='#e2b98c', plank='#d6a878', slab='#c48d6a', base='#a8758f', rug='#bfc9a3', rug2='#e9edd2'),
    'sage': dict(wall='#dbe8d8', wall2='#c7dbc6', trim='#f6fbf1', floor='#e8c9a0', plank='#dbb98d', slab='#9fb6a4', base='#7f8fb3', rug='#f0c7b5', rug2='#fbe8dc'),
    'rose': dict(wall='#f6d9de', wall2='#efc4cc', trim='#fff4f3', floor='#e9c2a4', plank='#ddb092', slab='#d39aa6', base='#9a86b8', rug='#c9c2e6', rug2='#ece8fb'),
}
P = PALETTES['oat']
shell_mats = {k: toon('shell_' + k, v) for k, v in P.items()}

# ---------- shell: floating slab, two cutaway walls, window, door, sofa, rug, table ----------
current = collection('shell')
F = 2.0   # half floor size
H = 3.0   # wall height
T = 0.18  # wall thickness
box('slab', (2 * F + 0.06, 2 * F + 0.06, 0.42), (0, 0, -0.21), shell_mats['slab'], 0.05)
box('base', (2 * F - 0.3, 2 * F - 0.3, 0.5), (0, 0, -0.66), shell_mats['base'], 0.08)
for i in range(8):  # floor planks, alternating tone
    w = 2 * F / 8
    box(f'plank{i}', (w - 0.012, 2 * F - 0.012, 0.04), (-F + w * (i + .5), 0, 0.02), shell_mats['floor' if i % 2 else 'plank'], 0.008)

back = box('wall_back', (2 * F + T, T, H), (-T / 2, F + T / 2, H / 2), shell_mats['wall'], 0.02)
left = box('wall_left', (T, 2 * F, H), (-F - T / 2, 0, H / 2), shell_mats['wall2'], 0.02)
box('cap_back', (2 * F + T + 0.04, T + 0.06, 0.08), (-T / 2, F + T / 2, H + 0.04), shell_mats['trim'], 0.02)
box('cap_left', (T + 0.06, 2 * F + 0.04, 0.08), (-F - T / 2, -0.02, H + 0.04), shell_mats['trim'], 0.02)
box('skirt_back', (2 * F, 0.04, 0.16), (0, F - 0.02, 0.12), shell_mats['trim'], 0.01)
box('skirt_left', (0.04, 2 * F, 0.16), (-F + 0.02, 0, 0.12), shell_mats['trim'], 0.01)

# arched window in the left wall
win_c = box('win_cut', (1, 1.1, 1.2), (-F - T / 2, -0.55, 1.75), shell_mats['trim'], 0)
arch = cyl('win_arch', 0.55, 1, (-F - T / 2, -0.55, 2.35), shell_mats['trim'], 48, 0, rot=(0, math.radians(90), 0))
cut(left, win_c); cut(left, arch)
sky = toon('sky', '#bfe0f0')
box('win_glass', (0.03, 1.1, 1.2), (-F - T + 0.02, -0.55, 1.75), sky, 0)
cyl('win_glass_top', 0.55, 0.03, (-F - T + 0.02, -0.55, 2.35), sky, 48, 0, rot=(0, math.radians(90), 0))
box('win_sill', (0.32, 1.3, 0.07), (-F + 0.02, -0.55, 1.13), shell_mats['trim'], 0.02)
box('win_mull_v', (0.05, 0.05, 1.75), (-F - T / 2 + 0.03, -0.55, 1.95), shell_mats['trim'], 0.01)
box('win_mull_h', (0.05, 1.1, 0.05), (-F - T / 2 + 0.03, -0.55, 1.85), shell_mats['trim'], 0.01)

# round porthole on the back wall, Monument Valley style
port = cyl('port_cut', 0.32, 1, (1.15, F + T / 2, 2.25), shell_mats['trim'], 48, 0, rot=(math.radians(90), 0, 0))
cut(back, port)
cyl('port_glass', 0.32, 0.03, (1.15, F + T - 0.02, 2.25), sky, 48, 0, rot=(math.radians(90), 0, 0))
ring = cyl('port_ring', 0.38, 0.06, (1.15, F - 0.01, 2.25), shell_mats['trim'], 48, 0.01, rot=(math.radians(90), 0, 0))
inner = cyl('port_ring_cut', 0.31, 1, (1.15, F, 2.25), shell_mats['trim'], 48, 0, rot=(math.radians(90), 0, 0))
cut(ring, inner)

rug_m, rug2_m = shell_mats['rug'], shell_mats['rug2']
r1 = cyl('rug', 1.25, 0.03, (0.35, -0.05, 0.055), rug2_m, 64, 0.01); r1.scale = (1, 0.78, 1)
r2 = cyl('rug_in', 1.08, 0.035, (0.35, -0.05, 0.06), rug_m, 64, 0.01); r2.scale = (1, 0.78, 1)

sofa_m, sofa2_m, cush = toon('sofa', '#ef9f86'), toon('sofa_dark', '#e08a74'), toon('cushion', '#fbd7a8')
leg = toon('wood', '#a56f52')
SX, SY = 0.35, F - 0.5
box('sofa_seat', (2.0, 0.85, 0.36), (SX, SY - 0.05, 0.36), sofa_m, 0.12)
box('sofa_back', (2.0, 0.3, 0.75), (SX, SY + 0.3, 0.72), sofa2_m, 0.13)
for sx in (-1, 1):
    box(f'sofa_arm{sx}', (0.28, 0.95, 0.62), (SX + sx * 1.0, SY, 0.5), sofa2_m, 0.12)
for sx in (-0.45, 0.45):
    box(f'sofa_cush{sx}', (0.82, 0.62, 0.14), (SX + sx, SY - 0.08, 0.6), cush, 0.06)
box('pillow', (0.42, 0.14, 0.38), (SX - 0.6, SY + 0.1, 0.84), toon('pillow', '#9ec2c9'), 0.08, rot=(math.radians(-12), 0, math.radians(8)))
for x in (-0.9, 0.9):
    for y in (-0.38, 0.4):
        cyl(f'sofa_leg{x}{y}', 0.045, 0.2, (SX + x, SY + y, 0.14), leg, 12, 0)

table_m = toon('table', '#fff1d6')
cyl('table_top', 0.55, 0.09, (0.45, -0.45, 0.52), table_m, 48, 0.03)
cyl('table_stem', 0.08, 0.4, (0.45, -0.45, 0.27), leg, 16, 0)
cyl('table_foot', 0.28, 0.05, (0.45, -0.45, 0.08), leg, 32, 0.015)
cyl('mug', 0.09, 0.15, (0.3, -0.38, 0.64), toon('mug', '#7aa6c9'), 24, 0.02)
box('book1', (0.34, 0.24, 0.05), (0.62, -0.55, 0.6), toon('book_a', '#f2b8b5'), 0.01, rot=(0, 0, math.radians(20)))
box('book2', (0.3, 0.22, 0.05), (0.6, -0.53, 0.65), toon('book_b', '#b9d3a8'), 0.01, rot=(0, 0, math.radians(-5)))

# ---------- collectable items ----------
ITEMS = {}
def item(key, label):
    global current
    current = collection(key); ITEMS[key] = label

item('plant', 'Pilea plant')
pot = toon('pot', '#e88f6d'); leaf = toon('leaf', '#6fae7e'); leaf2 = toon('leaf2', '#8cc58f')
PX, PY = -1.45, 1.45
blob('plant_shadow', 0.42, 0.42, (PX, PY))
cyl('pot', 0.3, 0.5, (PX, PY, 0.27), pot, 32, 0.03, r2=0.24)
cyl('pot_rim', 0.33, 0.08, (PX, PY, 0.52), pot, 32, 0.02)
cyl('soil', 0.28, 0.02, (PX, PY, 0.55), toon('soil', '#7a5a4a'), 32, 0)
for i, (a, tilt, z, s) in enumerate([(-60, 55, 1.15, 1), (10, 60, 1.0, .9), (80, 50, 1.3, 1.05), (150, 60, 0.95, .85), (220, 55, 1.15, .95), (-20, 20, 1.55, .85)]):
    a, t = math.radians(a), math.radians(tilt)
    d = 0.42 * math.sin(t) + 0.05
    lx, ly = PX + math.cos(a) * d, PY + math.sin(a) * d
    o = ball(f'leaf{i}', 0.4 * s, (lx, ly, z), leaf if i % 2 else leaf2, (1, 0.6, 0.1))
    o.rotation_euler = (t, 0, a - math.pi / 2)
    bpy.context.view_layer.update()
    a0, a1 = Vector((PX, PY, 0.55)), Vector((lx, ly, z)) - o.matrix_world.to_3x3() @ Vector((0, 0.25 * s, 0))
    st = cyl(f'stem{i}', 0.018, (a1 - a0).length, (a0 + a1) / 2, leaf, 8, 0)
    st.rotation_euler = (a1 - a0).to_track_quat('Z', 'Y').to_euler()

item('lamp', 'Mushroom lamp')
LX, LY = 1.68, 1.62
blob('lamp_shadow', 0.3, 0.3, (LX, LY))
cyl('lamp_base', 0.22, 0.06, (LX, LY, 0.04), toon('brass', '#d9a35f'), 32, 0.02)
cyl('lamp_pole', 0.03, 1.5, (LX, LY, 0.8), toon('brass', '#d9a35f'), 12, 0)
shade_o = cyl('lamp_shade', 0.42, 0.42, (LX, LY, 1.68), toon('shade', '#fbe3a2'), 40, 0.04, r2=0.18)
ball('lamp_bulb', 0.12, (LX, LY, 1.48), flat('bulb', '#fff6cf'))

item('cat', 'Sleepy cat')
fur, fur2 = toon('fur', '#f4b26b'), toon('fur_light', '#fff0dc')
CX, CY = 1.25, -0.95
blob('cat_shadow', 0.42, 0.3, (CX, CY))
ball('cat_body', 0.34, (CX, CY, 0.25), fur, (1.25, 0.9, 0.62))
ball('cat_head', 0.22, (CX - 0.28, CY - 0.2, 0.38), fur, (1, 1, 0.9))
ball('cat_muzzle', 0.09, (CX - 0.4, CY - 0.36, 0.33), fur2, (1, 1, 0.75))
for s in (-1, 1):
    ear = cyl(f'cat_ear{s}', 0.08, 0.14, (CX - 0.28 + s * 0.1, CY - 0.2 + s * 0.06, 0.6), fur, 4, 0.01, r2=0.0)
    ear.rotation_euler = (s * math.radians(10), math.radians(-15), math.radians(45))
tail = ball('cat_tail', 0.1, (CX + 0.22, CY - 0.32, 0.12), fur, (2.4, 0.9, 0.8)); tail.rotation_euler = (0, 0, math.radians(-30))
for s in (-1, 1):
    eye = box(f'cat_eye{s}', (0.08, 0.02, 0.015), (CX - 0.38 + s * 0.05, CY - 0.34 - s * 0.06, 0.43), flat('eye', '#4a3a4f'), 0.005, rot=(0, 0, math.radians(-45)))

item('poster', 'Travel print')
PXp = -0.65
box('poster_frame', (0.95, 0.05, 1.2), (PXp, F - 0.03, 1.95), toon('frame', '#fffaf0'), 0.02)
box('poster_sky', (0.8, 0.03, 1.05), (PXp, F - 0.06, 1.95), toon('p_sky', '#ffd6a5'), 0)
cyl('poster_sun', 0.17, 0.02, (PXp + 0.12, F - 0.08, 2.15), toon('p_sun', '#ff9f80'), 32, 0, rot=(math.radians(90), 0, 0))
for i, (dx, h, c) in enumerate([(-0.18, 0.5, '#8ec3c0'), (0.16, 0.36, '#6ba7a9')]):
    m = cyl(f'poster_hill{i}', 0.3, 0.02, (PXp + dx, F - 0.085, 1.42 + h / 2), toon(f'p_hill{i}', c), 3, 0, rot=(math.radians(90), 0, 0))
    m.scale = (1, 1.4 * h, 1)
box('poster_sea', (0.8, 0.02, 0.18), (PXp, F - 0.09, 1.51), toon('p_sea', '#7cb6d8'), 0)

item('shelf', 'Book shelf')
wood2 = toon('shelf', '#e7c39b');
SHx, SHy = -F + 0.25, 0.75
blob('shelf_shadow', 0.3, 0.55, (SHx + 0.05, SHy))
box('shelf_side_a', (0.38, 0.05, 1.6), (SHx, SHy - 0.42, 0.8), wood2, 0.015)
box('shelf_side_b', (0.38, 0.05, 1.6), (SHx, SHy + 0.42, 0.8), wood2, 0.015)
box('shelf_back', (0.03, 0.88, 1.6), (SHx - 0.17, SHy, 0.8), toon('shelf_back', '#d8ad80'), 0)
for i, z in enumerate((0.05, 0.55, 1.08, 1.6)):
    box(f'shelf_board{i}', (0.4, 0.9, 0.05), (SHx, SHy, z), wood2, 0.015)
cols = ['#f2b8b5', '#9ec2c9', '#f7d488', '#b9d3a8', '#c9b6e4', '#ef9f86']
for row, z in enumerate((0.08, 0.58)):
    y = SHy - 0.36
    for k in range(5):
        w, h = 0.07 + (k % 2) * 0.03, 0.34 - (k % 3) * 0.05
        box(f'book_{row}_{k}', (0.26, w, h), (SHx + 0.02, y + w / 2, z + h / 2), toon(f'bk{(row * 5 + k) % 6}', cols[(row * 5 + k) % 6]), 0.008)
        y += w + 0.02
ball('shelf_vase', 0.12, (SHx + 0.03, SHy + 0.15, 1.24), toon('vase', '#9ec2c9'), (1, 1, 1.3))
cyl('shelf_frame', 0.11, 0.03, (SHx + 0.02, SHy - 0.2, 1.24), toon('frame', '#fffaf0'), 24, 0, rot=(0, math.radians(80), 0))

item('suitcase', 'Vintage suitcase')
case_m, strap = toon('case', '#6fa8c7'), toon('strap', '#a56f52')
SCx, SCy = -1.35, -1.3
blob('case_shadow', 0.5, 0.4, (SCx, SCy))
box('case_body', (0.72, 0.32, 0.52), (SCx, SCy, 0.3), case_m, 0.06, rot=(0, 0, math.radians(15)))
box('case_top', (0.56, 0.26, 0.35), (SCx + 0.04, SCy + 0.01, 0.74), toon('case_b', '#f2b8b5'), 0.05, rot=(0, 0, math.radians(5)))
for dx in (-0.2, 0.2):
    box(f'case_strap{dx}', (0.06, 0.34, 0.54), (SCx + dx * math.cos(math.radians(15)), SCy + dx * math.sin(math.radians(15)), 0.3), strap, 0.01, rot=(0, 0, math.radians(15)))
handle = cyl('case_handle', 0.09, 0.04, (SCx + 0.04, SCy + 0.01, 0.95), strap, 24, 0, rot=(math.radians(90), 0, math.radians(5)))
hcut = cyl('case_handle_cut', 0.06, 1, (SCx + 0.04, SCy + 0.01, 0.95), strap, 24, 0, rot=(math.radians(90), 0, math.radians(5)))
cut(handle, hcut)

item('globe', 'Explorer globe')
GX, GY = 1.6, 0.05
blob('globe_shadow', 0.32, 0.32, (GX, GY))
cyl('globe_stand', 0.22, 0.06, (GX, GY, 0.04), toon('brass', '#d9a35f'), 32, 0.02)
cyl('globe_post', 0.03, 0.55, (GX, GY, 0.32), toon('brass', '#d9a35f'), 12, 0)
g = ball('globe_ball', 0.33, (GX, GY, 0.92), toon('ocean', '#7cb6d8'))
for i, (dz, a, s) in enumerate([(0.12, 20, 0.16), (-0.1, 140, 0.13), (0.02, 260, 0.11)]):
    a = math.radians(a)
    ball(f'globe_land{i}', s, (GX + math.cos(a) * 0.27, GY + math.sin(a) * 0.27, 0.92 + dz), toon('land', '#9fcf8f'), (0.6, 0.6, 0.9))
ring2 = cyl('globe_ring', 0.4, 0.03, (GX, GY, 0.92), toon('brass', '#d9a35f'), 48, 0, rot=(math.radians(70), 0, math.radians(45)))
rc = cyl('globe_ring_cut', 0.37, 1, (GX, GY, 0.92), toon('brass', '#d9a35f'), 48, 0, rot=(math.radians(70), 0, math.radians(45)))
cut(ring2, rc)

# ---------- render ----------
def project(co):
    from bpy_extras.object_utils import world_to_camera_view
    v = world_to_camera_view(scene, cam, Vector(co))
    return v.x, 1 - v.y, v.z

def bounds(c):
    pts = []
    for o in c.all_objects:
        if o.hide_render or o.type != 'MESH':
            continue
        pts += [o.matrix_world @ Vector(b) for b in o.bound_box]
    return pts

def show_only(names):
    for k, c in coll.items():
        c.hide_render = k not in names

manifest = {'size': SIZE, 'items': {}, 'palettes': list(PALETTES)}
for key in ITEMS:
    pts = bounds(coll[key])
    xs, ys, ds = zip(*(project(p) for p in pts))
    centre = sum(pts, Vector()) / len(pts)
    pad = 0.012
    # snap to whole pixels so the cropped render lines up exactly with the shell
    px = lambda v, f: max(0, min(SIZE, f(v * SIZE))) / SIZE
    manifest['items'][key] = {
        'label': ITEMS[key],
        'box': [px(min(xs) - pad, math.floor), px(min(ys) - pad, math.floor), px(max(xs) + pad, math.ceil), px(max(ys) + pad, math.ceil)],
        'depth': round(project(centre)[2], 3),  # camera distance: larger is further away, drawn first
    }

def render(path):
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    print('rendered', path.name)

bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'blender' / 'pocket_room.blend'))
if RENDER:
    for name, pal in ([] if QUICK else PALETTES.items()):
        for k, v in pal.items():
            mats['shell_' + k].node_tree.nodes['Mix'].inputs['A'].default_value = tuple(c * s for c, s in zip(hexrgb(v), SHADOW))
            mats['shell_' + k].node_tree.nodes['Mix'].inputs['B'].default_value = hexrgb(v)
        show_only({'shell'})
        render(OUT / f'shell-{name}.webp')
    if QUICK:
        show_only(set(coll)); render(OUT / '_all.png')
    for key in ([] if QUICK else ITEMS):
        show_only({key})
        x0, y0, x1, y1 = manifest['items'][key]['box']
        r = scene.render
        r.use_border = r.use_crop_to_border = True
        r.border_min_x, r.border_max_x, r.border_min_y, r.border_max_y = x0, x1, 1 - y1, 1 - y0
        render(OUT / f'{key}.webp')
        r.use_border = False
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=1), encoding='utf-8')
print('done', json.dumps(manifest))
