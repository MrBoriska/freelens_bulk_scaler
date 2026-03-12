const Lens = (function() {
    try { return require("@freelensapp/extensions"); } catch(e) {}
    try { return require("@k8slens/extensions"); } catch(e) {}
    return window.FreelensExtensions || window.LensExtensions || {};
})();

const Renderer = Lens.Renderer || {};
const React = Renderer.React || window.React;
const Component = Renderer.Component || Lens.Component || {};
const K8sApi = Lens.K8sApi || Renderer.K8sApi || {};

class BulkScalerExtension extends Renderer.LensExtension {
  kubeObjectMenuItems = [
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      components: {
        MenuItem: (props) => {
          const { object, closeMenu } = props;

          const handleScale = async (num) => {
            if (typeof closeMenu === "function") {
              try { closeMenu(); } catch(e) {}
            }

            try {
              // 1. Получаем API
              const api = K8sApi.deploymentApi || K8sApi.apiManager.getApi("/apis/apps/v1/deployments");
              if (!api) throw new Error("Deployment API not found");

              // 2. Получаем Store
              const store = K8sApi.apiManager.getStore(api);
              
              // 3. Пытаемся достать выделенные элементы (пробуем метод и свойство)
              let selection = [];
              if (store) {
                  if (typeof store.getSelectedItems === "function") {
                      selection = store.getSelectedItems();
                  } else if (store.selectedItems) {
                      selection = store.selectedItems; // В некоторых версиях это массив MobX
                  }
              }
              
              // 4. Определяем цели
              const targets = (selection && selection.length > 0) ? selection : [object];

              console.log(`Bulk-Scaler: Scaling ${targets.length} deployments to ${num}`);

              let successCount = 0;
              for (const item of targets) {
                const name = item.metadata?.name || (typeof item.getName === "function" ? item.getName() : item.name);
                const namespace = item.metadata?.namespace || (typeof item.getNs === "function" ? item.getNs() : item.namespace);

                if (name && namespace) {
                  await api.scale({ name, namespace }, num);
                  successCount++;
                }
              }

              if (Component.Notifications) {
                Component.Notifications.ok(`Успешно: ${successCount} деплойментов масштабированы до ${num}`);
              }
            } catch (err) {
              console.error("Bulk Scale Error:", err);
              if (Component.Notifications) {
                const errMsg = err.messages ? err.messages[0] : err.message;
                Component.Notifications.error("Ошибка: " + errMsg);
              }
            }
          };

          if (!React || !Component.MenuItem) return null;

          return React.createElement(React.Fragment, null,
            React.createElement(Component.MenuItem, { onClick: () => handleScale(0) },
              React.createElement(Component.Icon, { material: "trending_down", interactive: true }),
              React.createElement("span", { className: "title" }, "Bulk Scale Selected to 0")
            ),
            React.createElement(Component.MenuItem, { onClick: () => handleScale(1) },
              React.createElement(Component.Icon, { material: "trending_up", interactive: true }),
              React.createElement("span", { className: "title" }, "Bulk Scale Selected to 1")
            )
          );
        }
      }
    }
  ];
}

module.exports = {
  default: BulkScalerExtension
};
