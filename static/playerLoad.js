(function () {
    const loadingElement = document.getElementById("loading");
    const unsupportedFeatures = [];
    if (typeof BigInt === "undefined") {
        unsupportedFeatures.push("BigInt");
    }
    if (typeof String.prototype.matchAll === "undefined") {
        unsupportedFeatures.push("String.prototype.matchAll");
    }
    if (unsupportedFeatures.length > 0) {
        let text = document.createElement("p");
        text.innerHTML = "Your browser does not support the following features:";
        loadingElement.innerHTML = "";
        loadingElement.appendChild(text);
        const list = document.createElement("ul");
        unsupportedFeatures.forEach(feature => {
            const item = document.createElement("li");
            item.innerHTML = feature;
            list.appendChild(item);
        });
        loadingElement.appendChild(list);
        text = document.createElement("p");
        text.innerHTML = "These features are required for this app. Consider updating your browser.";
        loadingElement.appendChild(text);
        return;
    }
})();
