let tmpl = document.createElement("template");
tmpl.innerHTML = `
    <style>
        #floating-menu {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            min-width: 100px !important;
            background-color: white !important;
            color: black !important;
            font-size: 1em !important;
            padding: 10px !important;
            border-radius: 10px !important;
            box-shadow: 10px 5px 5px rgba(0,0,0,0.2);
            z-index: 9999;
            display: none;
        }
        h3 {
            margin: 3px 0 !important;
        }
        .focus-container {
            display: inline-block;
            margin-top: 10px;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 34px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #2196F3;
        }
        input:focus + .slider {
            box-shadow: 0 0 1px #2196F3;
        }
        input:checked + .slider:before {
            -webkit-transform: translateX(20px);
            -ms-transform: translateX(20px);
            transform: translateX(20px);
        }
    </style>

    <div id="floating-menu">
        <h3>Highlights</h3>
        <div id="categories">
        </div>
        <div class="focus-container">
            <label class="switch">
                <input type="checkbox" id="focus-mode">
                <span class="slider round"></span>
            </label>
        </div>
    </div>
`;

class FloatingMenu extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    static get observedAttributes() {
        return ["categories"];
    }

    render() {
        let shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(tmpl.content.cloneNode(true));
        this.floatingMenu = this.shadowRoot.getElementById("floating-menu");
        this.categoriesMenu = this.shadowRoot.getElementById("categories");
        this.focusMode = this.shadowRoot.getElementById("focus-mode");
        this.focusMode.addEventListener("change", (evt) => {
            this.dispatchEvent(new CustomEvent("focusModeChanged", { detail: { focusMode: evt.target.checked } }));
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "categories") {
            this.activeCategories = JSON.parse(newValue);
            if (this.activeCategories.length > 0) {
                this.floatingMenu.style.display = "block";
                this.renderCategories(this.activeCategories);
            } else {
                this.floatingMenu.style.display = "none";
            }
        }
    }

    renderCategories(categories) {
        this.categoriesMenu.textContent = "";
        categories.forEach((category) => {
            let categoriesTmpl = this.getCategoryTemplate(category);
            this.categoriesMenu.appendChild(categoriesTmpl.content.cloneNode(true));
            this.shadowRoot.getElementById(category).addEventListener("change", this.categoryClicked.bind(this));
        });
    }

    getCategoryTemplate(name) {
        let categoryTmpl = document.createElement("template");
        categoryTmpl.innerHTML = `
            <style>
            </style>
            <div>
                <input id="${name}" type="checkbox" name="${name}" checked>
                <label for="${name}">${name}</label>
            </div>
        `;
        return categoryTmpl;
    }

    categoryClicked(evt) {
        if (evt.target.classList.contains("active")) {
            evt.target.classList.remove("active");
            this.activeCategories = this.activeCategories.filter((el) => el !== evt.target.id);
        } else {
            evt.target.classList.add("active");
            this.activeCategories.push(evt.target.id);
        }
        this.dispatchEvent(
            new CustomEvent("updateActiveCategories", { detail: { activeCategories: this.activeCategories } })
        );
    }
}

window.customElements.define("floating-menu", FloatingMenu);
