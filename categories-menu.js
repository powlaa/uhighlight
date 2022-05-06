let tmpl = document.createElement("template");
tmpl.innerHTML = `
    <style>
        #categoriesMenu {
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
        .active {
            font-weight: bold !important;
        }
    </style>
    <div id="categoriesMenu">
    </div>
`;

class CategoriesMenu extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    get highlightTemplate() {
        return this.shadowRoot.getElementById("highlightTemplate");
    }

    static get observedAttributes() {
        return ["categories"];
    }

    render() {
        let shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(tmpl.content.cloneNode(true));
        this.categoriesMenu = this.shadowRoot.getElementById("categoriesMenu");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "categories") {
            console.log(oldValue + " " + newValue);
            this.activeCategories = JSON.parse(newValue);
            if (this.activeCategories.length > 0) {
                this.categoriesMenu.style.display = "block";
                this.renderCategories(this.activeCategories);
            }
        }
    }

    renderCategories(categories) {
        categories.forEach((category) => {
            let categoriesTmpl = this.getCategoryTemplate(category);
            this.categoriesMenu.appendChild(categoriesTmpl.content.cloneNode(true));
            this.shadowRoot.getElementById(category).addEventListener("click", this.categoryClicked);
        });
    }

    getCategoryTemplate(name) {
        //TODO: Add checkboxes
        let categoryTmpl = document.createElement("template");
        categoryTmpl.innerHTML = `
            <style>
            </style>
            <div id="${name}" class="active">${name}</div>
        `;
        return categoryTmpl;
    }

    categoryClicked(evt) {
        if (evt.target.classList.contains("active")) {
            evt.target.classList.remove("active");
            this.activeCategories = this.activeCategories.filter((el) => el === evt.target.id);
        } else {
            evt.target.classList.add("active");
            this.activeCategories.push(evt.target.id);
        }
        this.dispatchEvent(
            new CustomEvent("updateActiveCategories", { detail: { activeCategories: this.activeCategories } })
        );
    }
}

window.customElements.define("categories-menu", CategoriesMenu);
