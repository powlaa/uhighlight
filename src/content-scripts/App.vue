<template>
  <div id="sample_text">hello sample</div>
  <span
    ref="highlightTemplate"
    id="highlightTemplate"
    class="uhighlight"
    style="display: none"
    ><button class="uhighlight-delete-btn">X</button></span
  >
  <HighlighterPopup
    :position="highlighterPopupPosition"
    :colors="colors"
    :categories="categories"
    @addHighlight="highlightSelection"
  ></HighlighterPopup>
</template>

<script setup>
import { ref, onMounted } from "vue";
import HighlighterPopup from "./HighlighterPopup.vue";

const highlightTemplate = ref(null);
const highlighterPopupPosition = ref({ display: "none" });

let focusMode = false;
let colors = [];
let categories = [];
let usedCategories = [];

onMounted(() => {
  chrome.storage.local.get(["pages", "colors", "categories"], (res) => {
    colors = res.colors;
    categories = res.categories;
    let index = res.pages.findIndex((el) => el.url === window.location.href);
    if (index >= 0) {
      res.pages[index].highlights.forEach((highlight) => {
        let range = buildRange(highlight.rInfo);
        highlightRange(
          range,
          highlight.id,
          highlight.category,
          highlight.color
        );
      });

      usedCategories = [
        ...new Set(res.pages[index].highlights.map((el) => el.category)),
      ];
    }
  });
  document.addEventListener("click", () => {
    if (getSelectedText().length > 0) {
      if (focusMode) highlightSelection("color0", "Apples");
      else setHighlighterPopupPosition();
    }
  });

  document.addEventListener("selectionchange", () => {
    if (getSelectedText().length === 0) {
      hideHighlighterPopup();
    }
  });
});

function setHighlighterPopupPosition() {
  const rangeBounds = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();
  // Substract width of marker button -> 40px / 2 = 20
  highlighterPopupPosition.value = {
    top: rangeBounds.top - 60,
    left: rangeBounds.left + rangeBounds.width / 2,
    display: "block",
  };
}

function hideHighlighterPopup() {
  highlighterPopupPosition.value = { display: "none" };
}

function getSelectedText() {
  return window.getSelection().toString();
}

function highlightRange(range, id, category, color) {
  const clone = highlightTemplate.value.cloneNode(true);
  clone.classList.add("uhighlight-" + category);
  clone.style.backgroundColor = color;
  clone.style.display = "inline";
  clone.appendChild(range.extractContents());
  clone.id = "uhighlight-" + id;
  clone
    .getElementsByClassName("uhighlight-delete-btn")[0]
    .addEventListener("click", deleteHighlightClicked.bind(this));
  range.insertNode(clone);
}

function deleteHighlightClicked(evt) {
  deleteHighlight(evt.target.parentElement);
}

function deleteHighlight(element) {
  let id = parseInt(element.id.substring(11));
  //remove delete button
  element.removeChild(element.childNodes[0]);
  element.outerHTML = element.innerHTML;

  //delete from storage
  chrome.storage.local.get(["pages"], (res) => {
    let index = res.pages.findIndex((el) => el.url === window.location.href);
    if (index >= 0) {
      res.pages[index].highlights = res.pages[index].highlights.filter(
        (el) => el.id !== id
      );

      categories = [
        ...new Set(res.pages[index].highlights.map((el) => el.category)),
      ];
      // this.dispatchEvent(new CustomEvent("updateCategories", { detail: { categories: this.categories } }));
      if (res.pages[index].highlights.length > 0) {
        chrome.storage.local.set({
          pages: res.pages,
        });
      } else {
        chrome.storage.local.set({
          pages: res.pages.filter((page) => page.url !== window.location.href),
        });
      }
    }
  });
}

function highlightSelection(colorIndex, category) {
  var userSelection = window.getSelection();
  for (let i = 0; i < userSelection.rangeCount; i++) {
    let range = userSelection.getRangeAt(i);
    let startNode = range.startContainer;
    let endNode = range.endContainer;

    if (startNode.nodeType == 3) {
      var startIsText = true;
      var startFlag = startNode.parentNode;
      startNode = startNode.nodeValue;
    } else {
      var startIsText = false;
      var startFlag = startNode;
    }
    if (endNode.nodeType == 3) {
      var endIsText = true;
      var endFlag = endNode.parentNode;
      endNode = endNode.nodeValue;
    } else {
      var endIsText = false;
      var endFlag = endNode;
    }

    let startOffset = range.startOffset;
    let endOffset = range.endOffset;

    let startTagName = startFlag.nodeName;
    let startHTML = startFlag.innerHTML;

    let endTagName = endFlag.nodeName;
    let endHTML = endFlag.innerHTML;

    let rInfo = {
      startNode: startNode,
      startOffset: startOffset,
      startIsText: startIsText,
      startTagName: startTagName,
      startHTML: startHTML,

      endNode: endNode,
      endOffset: endOffset,
      endIsText: endIsText,
      endTagName: endTagName,
      endHTML: endHTML,
    };
    var id = Date.now();
    saveHighlight(id, rInfo, category, colors[colorIndex]).then(() => {
      highlightRange(range, id, category, colors[colorIndex]);
    });
    removeSelection();
  }
}

function removeSelection() {
  window.getSelection().empty();
}

function saveHighlight(id, rInfo, category, color) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pages"], (res) => {
      let index = res.pages.findIndex((el) => el.url === window.location.href);
      if (index >= 0) {
        res.pages[index].highlights.push({ id, category, color, rInfo });
      } else {
        res.pages.push({
          url: window.location.href,
          highlights: [{ id, category, color, rInfo }],
        });
      }
      chrome.storage.local.set(
        {
          pages: res.pages,
        },
        () => {
          resolve();
        }
      );
    });
  });
}

function buildRange({
  startNode,
  startIsText,
  startOffset,
  startTagName,
  startHTML,
  endNode,
  endIsText,
  endOffset,
  endTagName,
  endHTML,
}) {
  let sP = findEle(startTagName, startHTML);
  let eP = findEle(endTagName, endHTML);
  var s, e;
  if (startIsText) {
    let childs = sP.childNodes;
    for (let i = 0; i < childs.length; i++) {
      if (childs[i].nodeType == 3 && childs[i].nodeValue == startNode)
        s = childs[i];
    }
  } else {
    s = sP;
  }
  if (endIsText) {
    let childs = eP.childNodes;
    for (let i = 0; i < childs.length; i++) {
      if (childs[i].nodeType == 3 && childs[i].nodeValue == endNode)
        e = childs[i];
    }
  } else {
    e = eP;
  }
  let range = document.createRange();
  range.setStart(s, startOffset);
  range.setEnd(e, endOffset);
  return range;
}

function findEle(tagName, innerHTML) {
  let list = document.getElementsByTagName(tagName);
  for (let i = 0; i < list.length; i++) {
    if (list[i].innerHTML == innerHTML) {
      return list[i];
    }
  }
}
</script>

<style src="./content.css"></style>