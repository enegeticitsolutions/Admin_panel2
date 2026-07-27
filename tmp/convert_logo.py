import struct
import zlib
import os

def process_png(filepath, outpath):
    with open(filepath, 'rb') as f:
        data = f.read()

    # Verify PNG signature
    assert data[:8] == b'\x89PNG\r\n\x1a\n'

    pos = 8
    width = height = bit_depth = color_type = None
    chunks = []

    while pos < len(data):
        length, chunk_type = struct.unpack('>I4s', data[pos:pos+8])
        chunk_data = data[pos+8:pos+8+length]
        crc = data[pos+8+length:pos+12+length]
        pos += 12 + length

        if chunk_type == b'IHDR':
            width, height, bit_depth, color_type, comp, filt, inter = struct.unpack('>IIBBBBB', chunk_data)
            chunks.append((chunk_type, chunk_data))
        elif chunk_type == b'IDAT':
            chunks.append((chunk_type, chunk_data))
        else:
            chunks.append((chunk_type, chunk_data))

    idat_data = b''.join(cd for ct, cd in chunks if ct == b'IDAT')
    decompressed = zlib.decompress(idat_data)

    # Process pixels: assuming 8-bit RGBA (color_type 6) or RGB (color_type 2)
    bpp = 4 if color_type == 6 else 3
    row_bytes = width * bpp + 1
    new_rows = []

    for y in range(height):
        row = decompressed[y * row_bytes : (y + 1) * row_bytes]
        filter_type = row[0]
        # For simple unfiltered or reconstructed row:
        # Note: icon.png might have filter types. Let's use Python's built-in image reading or raw byte handling.
        new_rows.append(row)

    print(f"IHDR: {width}x{height}, depth={bit_depth}, color_type={color_type}")

if __name__ == '__main__':
    process_png('apps/mobile-app/assets/images/icon.png', 'tmp/test_out.png')
