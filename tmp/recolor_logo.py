import struct
import zlib

def paeth_predictor(a, b, c):
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    elif pb <= pc:
        return b
    else:
        return c

def recolor_png(in_path, out_path):
    with open(in_path, 'rb') as f:
        data = f.read()

    assert data[:8] == b'\x89PNG\r\n\x1a\n'

    pos = 8
    width = height = bit_depth = color_type = None
    chunks = []
    idat_list = []

    while pos < len(data):
        length, chunk_type = struct.unpack('>I4s', data[pos:pos+8])
        chunk_data = data[pos+8:pos+8+length]
        pos += 12 + length

        if chunk_type == b'IHDR':
            width, height, bit_depth, color_type, comp, filt, inter = struct.unpack('>IIBBBBB', chunk_data)
        elif chunk_type == b'IDAT':
            idat_list.append(chunk_data)

    decompressed = zlib.decompress(b''.join(idat_list))
    bpp = 4 # RGBA
    stride = width * bpp

    # Unfilter PNG scanlines
    recon = bytearray(height * stride)
    prior_line = bytearray(stride)

    src_pos = 0
    for y in range(height):
        filter_type = decompressed[src_pos]
        src_pos += 1
        raw_line = decompressed[src_pos : src_pos + stride]
        src_pos += stride

        recon_line = bytearray(stride)
        for i in range(stride):
            raw = raw_line[i]
            a = recon_line[i - bpp] if i >= bpp else 0
            b = prior_line[i]
            c = prior_line[i - bpp] if i >= bpp else 0

            if filter_type == 0:
                val = raw
            elif filter_type == 1:
                val = (raw + a) & 0xFF
            elif filter_type == 2:
                val = (raw + b) & 0xFF
            elif filter_type == 3:
                val = (raw + (a + b) // 2) & 0xFF
            elif filter_type == 4:
                val = (raw + paeth_predictor(a, b, c)) & 0xFF
            else:
                raise ValueError(f"Unknown filter type {filter_type}")

            recon_line[i] = val

        recon[y * stride : (y + 1) * stride] = recon_line
        prior_line = recon_line

    # Recolor pixels: Turn white/light emblem pixels into black (0,0,0)
    for i in range(0, len(recon), 4):
        r, g, b, a = recon[i], recon[i+1], recon[i+2], recon[i+3]
        if a > 10:
            # Check if it's part of the white logo symbol (high RGB values)
            if r > 180 and g > 180 and b > 180:
                recon[i] = 0
                recon[i+1] = 0
                recon[i+2] = 0
            elif r > 120 and g > 120 and b > 120 and abs(r - g) < 40 and abs(g - b) < 40:
                # Anti-aliased white edges -> scale down to dark grey / black
                factor = 1.0 - (r / 255.0)
                recon[i] = int(recon[i] * factor)
                recon[i+1] = int(recon[i+1] * factor)
                recon[i+2] = int(recon[i+2] * factor)

    # Re-encode as uncompressed (filter 0) PNG
    filtered_data = bytearray()
    for y in range(height):
        filtered_data.append(0) # Filter 0
        filtered_data.extend(recon[y * stride : (y + 1) * stride])

    compressed_idat = zlib.compress(bytes(filtered_data), level=9)

    def make_chunk(ctype, cdata):
        buf = ctype + cdata
        crc = zlib.crc32(buf) & 0xFFFFFFFF
        return struct.pack('>I', len(cdata)) + buf + struct.pack('>I', crc)

    ihdr_data = struct.pack('>IIBBBBB', width, height, bit_depth, color_type, 0, 0, 0)
    out_png = b'\x89PNG\r\n\x1a\n' + make_chunk(b'IHDR', ihdr_data) + make_chunk(b'IDAT', compressed_idat) + make_chunk(b'IEND', b'')

    with open(out_path, 'wb') as f:
        f.write(out_png)

    print(f"Successfully recolored {in_path} -> {out_path}")

if __name__ == '__main__':
    recolor_png('apps/mobile-app/assets/images/icon.png', 'apps/mobile-app/assets/images/icon.png')
    recolor_png('apps/mobile-app/assets/images/logo_symbol.png', 'apps/mobile-app/assets/images/logo_symbol.png')
    recolor_png('apps/sathi-app/assets/images/icon.png', 'apps/sathi-app/assets/images/icon.png')
    recolor_png('apps/sathi-app/assets/images/logo_symbol.png', 'apps/sathi-app/assets/images/logo_symbol.png')
