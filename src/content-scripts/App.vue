<template>
  <span
    ref="highlightTemplate"
    id="highlightTemplate"
    class="uhighlight"
    style="display: none"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="uhighlight-delete-btn"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    <div class="uhighlight-note-input"></div>
    <div class="uhighlight-note-overlay">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style="width: 15px; height: 15px"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </span>

  <HighlighterPopup
    :position="highlighterPopupPosition"
    :colors="currentColors"
    :categories="categories"
    @addHighlight="highlightSelection"
    @addCategory="addCategory"
  ></HighlighterPopup>
  <FloatingMenu
    v-model:focus="focusMode"
    :categories="categories"
    :colors="currentColors"
    :darkMode="darkMode"
    :hidden="hideFloatingMenu"
    :usedCategories="usedCategories"
    @chooseColor="(colorIndex) => (focusModeColorIndex = colorIndex)"
    @darkModeChanged="
      (newDarkModeValue) => {
        darkMode = newDarkModeValue;
        saveDarkMode(darkMode);
      }
    "
    @updateActiveCategories="updateVisibleCategories"
    @updateSelectedCategory="(category) => (focusModeCategory = category)"
  ></FloatingMenu>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import HighlighterPopup from "./HighlighterPopup.vue";
import FloatingMenu from "./FloatingMenu.vue";

const highlightTemplate = ref(null);
const highlighterPopupPosition = ref({ display: "none" });

const focusMode = ref(false);
const usedCategories = ref([]);
let focusModeColorIndex = 0;
let focusModeCategory = "";
let currentColors = [];
let colors = { lightMode: [], darkMode: [] };
let darkMode = ref(false);
let categories = [];
let hideFloatingMenu = false;
const editors = {};

onMounted(() => {
  document.documentElement.addEventListener("click", () => {
    const inputs = document.getElementsByClassName("uhighlight-note-input");
    const overlays = document.getElementsByClassName("uhighlight-note-overlay");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].style.display = "none";
      overlays[i].style.display = null;
    }
  });
  window.onfocus = loadData;
  loadData(true);
  document.addEventListener("click", () => {
    if (getSelectedText().length > 0) {
      if (focusMode.value)
        highlightSelection(focusModeColorIndex, focusModeCategory);
      else setHighlighterPopupPosition();
    }
  });

  document.addEventListener("selectionchange", () => {
    if (getSelectedText().length === 0) {
      hideHighlighterPopup();
    }
  });
});

watch(darkMode, (newDarkModeValue) => {
  if (newDarkModeValue) {
    document.documentElement.className = "uhighlight-dark-mode";
    currentColors = colors.darkMode;
  } else {
    document.documentElement.className = "uhighlight-light-mode";
    currentColors = colors.lightMode;
  }
});

function loadData(addHighlights) {
  chrome.storage.local.get(
    ["pages", "lightColors", "darkColors", "categories", "hideFloatingMenu"],
    (res) => {
      let index = res.pages.findIndex((el) => el.url === window.location.href);
      if (index >= 0) {
        darkMode.value = res.pages[index].darkMode ?? userPrefersDarkMode();
        if (typeof addHighlights === "boolean" && addHighlights) {
          res.pages[index].highlights.forEach((highlight) => {
            let range = buildRange(highlight.rInfo);
            highlightRange(
              range,
              highlight.id,
              highlight.category,
              highlight.color,
              highlight.notes
            );
          });
        }

        usedCategories.value = [
          ...new Set(res.pages[index].highlights.map((el) => el.category)),
        ];
      } else {
        darkMode.value = userPrefersDarkMode();
      }
      colors = { lightMode: res.lightColors, darkMode: res.darkColors };
      currentColors = darkMode.value ? colors.darkMode : colors.lightMode;
      categories = res.categories;
      hideFloatingMenu = res.hideFloatingMenu;
    }
  );
}

function addCategory() {
  chrome.runtime.sendMessage({ action: "addCategory" });
}

function addNote(evt) {
  if (evt.target.classList.contains("uhighlight-delete-btn")) return;
  disabledEventPropagation(evt);
  const input = evt.target.getElementsByClassName("uhighlight-note-input")[0];
  evt.target.getElementsByClassName(
    "uhighlight-note-overlay"
  )[0].style.display = "none";
  input.style.display = "block";
  //focus the editor
  const id = evt.target.id.replace("uhighlight-", "");
  editors[id].commands.focus("end");
}

function saveNote(noteText, id) {
  chrome.storage.local.get(["pages"], (res) => {
    let index = res.pages.findIndex((el) => el.url === window.location.href);
    if (index >= 0) {
      let highlight = res.pages[index].highlights.find((h) => h.id == id);
      highlight.notes = noteText;
    } else {
      //TODO: something went wrong
    }
    chrome.storage.local.set({
      pages: res.pages,
    });
  });
}

function disabledEventPropagation(evt) {
  if (evt.stopPropagation) evt.stopPropagation();
  else if (window.event) window.event.cancelBubble = true;
}

function userPrefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function updateVisibleCategories(activeCategories) {
  categories.forEach((category) => {
    let highlights = document.getElementsByClassName("uhighlight-" + category);
    if (activeCategories.includes(category)) {
      for (let highlight of highlights) {
        highlight.classList.remove("uhighlight-hidden");
      }
    } else {
      for (let highlight of highlights) {
        highlight.classList.add("uhighlight-hidden");
      }
    }
  });
}

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

function highlightRange(range, id, category, color, notes) {
  const clone = highlightTemplate.value.cloneNode(true);
  clone.classList.add("uhighlight-" + category);
  clone.style.backgroundColor = color;
  clone.style.display = "inline";
  clone
    .getElementsByClassName("uhighlight-delete-btn")[0]
    .addEventListener("click", deleteHighlight.bind(this));

  clone.appendChild(range.extractContents());
  clone.id = "uhighlight-" + id;
  clone.addEventListener("click", addNote.bind(this));
  const input = clone.getElementsByClassName("uhighlight-note-input")[0];
  setupNoteInput(input, id, notes);
  if (notes)
    clone.getElementsByClassName("uhighlight-note-overlay")[0].innerHTML =
      notes;
  range.insertNode(clone);
}

function setupNoteInput(input, id, notes) {
  editors[id] = new Editor({
    element: input,
    extensions: [StarterKit],
    content: notes ? notes.toString() : "",
    onUpdate: ({ editor }) => {
      input.parentNode.getElementsByClassName(
        "uhighlight-note-overlay"
      )[0].innerHTML = editor.getHTML();
      saveNote(editor.getHTML(), id);
    },
  });
  input.addEventListener("click", disabledEventPropagation);
}

function deleteHighlight(evt) {
  const element = evt.target.parentElement;
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

      usedCategories.value = [
        ...new Set(res.pages[index].highlights.map((el) => el.category)),
      ];
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
    if (!usedCategories.value.find((cat) => cat === category))
      usedCategories.value = [...usedCategories.value, category];
    saveHighlight(
      id,
      userSelection.toString(),
      rInfo,
      category,
      currentColors[colorIndex]
    ).then(() => {
      highlightRange(range, id, category, currentColors[colorIndex], null);
    });
    removeSelection();
  }
}

function removeSelection() {
  window.getSelection().empty();
}

function saveHighlight(id, text, rInfo, category, color) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pages"], (res) => {
      let index = res.pages.findIndex((el) => el.url === window.location.href);
      if (index >= 0) {
        res.pages[index].darkMode = darkMode;
        res.pages[index].highlights.push({ id, category, color, text, rInfo });
      } else {
        res.pages.push({
          url: window.location.href,
          darkMode: darkMode,
          highlights: [{ id, category, color, text, rInfo }],
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

function saveDarkMode(newDarkModeValue) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pages"], (res) => {
      let index = res.pages.findIndex((el) => el.url === window.location.href);
      if (index >= 0) {
        res.pages[index].darkMode = newDarkModeValue;
      } else {
        res.pages.push({
          url: window.location.href,
          darkMode: newDarkModeValue,
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