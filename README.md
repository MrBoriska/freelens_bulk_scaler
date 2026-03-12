# FreeLens extension for scale to 1 or 0 all selected Deployments

## Installation

**File -> Extensions** and paste:

`https://github.com/MrBoriska/freelens_bulk_scaler/raw/refs/heads/master/bulk-scaler.tgz`


Add symlink if catch error (change username): 

```bash
# Перейдите в папку, где FreeLens ищет модули
cd /home/mrboriska/.config/Freelens/node_modules/

# Удалите (если есть) битую ссылку
rm -rf bulk-scaler

# Создайте правильную ссылку на установленное расширение
ln -s /home/mrboriska/.freelens/extensions/bulk-scaler bulk-scaler
```
