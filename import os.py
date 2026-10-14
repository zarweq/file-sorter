import os
import shutil
import sys
def get_extension(filename):
    if '.' in  filename:
        return filename.split('.')[-1]
    else:
        return ''

def get_category(extension):
    categories = {
        'jpg': 'Images',
        'jpeg': 'Images',
        'png': 'Images',
        'pdf': 'Documents',
        'docx': 'Documents',
        'mp3': 'Music',
        'mp4': 'Video',
        'zip': 'Archives',
    }
    return categories.get(extension, 'Other')


def ensure_folder(path):
    os.makedirs(path, exist_ok = True)
def get_available_path(dest_folder, filename):
    name, ext = os.path.splitext(filename)
    new_path = os.path.join(dest_folder, filename)
    counter = 1
    while os.path.exists(new_path):
        new_filename = f"{name}_{counter}{ext}"
        new_path = os.path.join(dest_folder, new_filename)
        counter += 1
    return new_path


def move_file(src_path, dest_folder):
    filename = os.path.basename(src_path)
    new_path = get_available_path(dest_folder, filename)
    shutil.move(src_path, new_path)
    log_action(f"Moved {filename} -> {dest_folder}")
def log_action(message):
    print(message)


def sort_folder(folder_path):
    files = os.listdir(folder_path)
    for filename in files:
        full_path = os.path.join(folder_path, filename)
        if not os.path.isfile(full_path):
            continue
        extension = get_extension(filename)
        category = get_category(extension)
        dest_folder = os.path.join(folder_path, category)
        ensure_folder(dest_folder)
        move_file(full_path, dest_folder)





def get_available_path(dest_folder, filename):
    name, ext = os.path.splitext(filename)
    new_path = os.path.join(dest_folder, filename)
    counter = 1
    while os.path.exists(new_path):
        new_filename = f"{name}_{counter}{ext}"
        new_path = os.path.join(dest_folder, new_filename)
        counter += 1
    return new_path

def show_menu():
    print('===File Sorter===')
    print('1. Отсортировать папку')
    print('2. Выход')


def main_loop():
    while True:
        show_menu()
        choice = input('Выбери действие:')
        if choice == '1':
            folder_path = input('Введи путь к папке:')
            try:
                sort_folder(folder_path)
            except FileNotFoundError:
                print('такой папки не существует')
        elif choice == '2':
            print('Exit')
            break
        else:
            print('Неверный выбор, попробуй снова')

if __name__ == "__main__":
    main_loop()