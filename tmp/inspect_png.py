import struct, zlib

def inspect_png(path):
    with open(path, 'rb') as f:
        data = f.read()

    pos = 8
    width = height = None
    idat = []
    while pos < len(data):
        l, ct = struct.unpack('>I4s', data[pos:pos+8])
        cd = data[pos+8:pos+8+l]
        pos += 12 + l
        if ct == b'IHDR':
            width, height = struct.unpack('>II', cd[:8])
        elif ct == b'IDAT':
            idat.append(cd)

    decomp = zlib.decompress(b''.join(idat))
    print(f"Total decompressed bytes: {len(decomp)}, expected: {height * (1 + width * 4)}")

    # Sample middle row pixels
    mid_y = height // 2
    stride = width * 4 + 1
    row = decomp[mid_y * stride : (mid_y + 1) * stride]
    fmt = row[0]
    print(f"Row {mid_y} filter: {fmt}")

    # Let's inspect unique RGB colors in sample
    colors = set()
    for i in range(1, len(row), 4):
        colors.add((row[i], row[i+1], row[i+2], row[i+3]))
    print(f"Sample colors in mid row: {list(colors)[:10]}")

inspect_png('apps/mobile-app/assets/images/icon.png')
