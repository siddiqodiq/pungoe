import os

def print_structure_only(folder_path, indent=0, full_path=None, output_file=None):
    if full_path is None:
        full_path = folder_path

    for item in sorted(os.listdir(folder_path)):
        full_path_item = os.path.join(folder_path, item)
        relative_path = os.path.relpath(full_path_item, full_path).replace("\\", "/")
        prefix = '    ' * indent + ('📁 ' if os.path.isdir(full_path_item) else '📄 ')
        
        if os.path.isdir(full_path_item):
            output_file.write(f"{prefix}{relative_path}/\n")
            print(f"{prefix}{relative_path}/")
            print_structure_only(full_path_item, indent + 1, full_path, output_file)
        else:
            output_file.write(f"{prefix}{relative_path}\n")
            print(f"{prefix}{relative_path}")


def print_structure_and_code(folder_path, indent=0, full_path=None, output_file=None):
    if full_path is None:
        full_path = folder_path

    for item in sorted(os.listdir(folder_path)):
        full_path_item = os.path.join(folder_path, item)
        relative_path = os.path.relpath(full_path_item, full_path).replace("\\", "/")
        prefix = '    ' * indent + ('📁 ' if os.path.isdir(full_path_item) else '📄 ')
        
        if os.path.isdir(full_path_item):
            output_file.write(f"{prefix}{relative_path}/\n")
            print_structure_and_code(full_path_item, indent + 1, full_path, output_file)
        else:
            output_file.write(f"{prefix}{relative_path}:\n")
            print(f"{prefix}{relative_path}:")
            try:
                with open(full_path_item, 'r', encoding='utf-8') as file:
                    for line in file:
                        output_file.write('    ' * (indent + 1) + line)
                        print('    ' * (indent + 1) + line.rstrip())
            except Exception as e:
                output_file.write('    ' * (indent + 1) + f"[Tidak bisa membaca file: {e}]\n")
                print('    ' * (indent + 1) + f"[Tidak bisa membaca file: {e}]")


# Input folder dari user
folder_path = input("Masukkan path folder yang ingin dilihat: ").rstrip("/")
mode = input("Tampilkan isi file juga? (y/n): ").strip().lower()

with open('output.txt', 'w', encoding='utf-8') as output_file:
    if mode == 'y':
        print_structure_and_code(folder_path, full_path=folder_path, output_file=output_file)
    else:
        print_structure_only(folder_path, full_path=folder_path, output_file=output_file)

print("\n✅ Output telah disimpan di output.txt")
