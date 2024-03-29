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
    :colors="colors"
    :darkMode="darkMode"
    :categories="categories"
    @addHighlight="highlightSelection"
    @addCategory="addCategory"
  ></HighlighterPopup>
  <FloatingMenu
    v-model:focus="focusMode"
    :categories="categories"
    :colors="colors"
    :darkMode="darkMode"
    :hidden="hideFloatingMenu"
    :usedCategories="usedCategories"
    @chooseColor="(colorIndex) => (focusModeColorIndex = colorIndex)"
    @darkModeChanged="changeDarkMode"
    @updateActiveCategories="updateVisibleCategories"
    @updateSelectedCategory="(category) => (focusModeCategory = category)"
  ></FloatingMenu>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { useMainStore } from "./store.js";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";
import HighlighterPopup from "./HighlighterPopup.vue";
import FloatingMenu from "./FloatingMenu.vue";

const store = useMainStore();
const { pages, highlights, categories, colors, hideFloatingMenu, getPage } =
  storeToRefs(useMainStore());

const highlightTemplate = ref(null);
const highlighterPopupPosition = ref({ display: "none" });

const focusMode = ref(false);
const usedCategories = ref([]);
let focusModeColorIndex = 0;
let focusModeCategory = "";
const darkMode = ref(false);
const editors = {};

onMounted(() => {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = "upgrade-insecure-requests";
  (document.head || document.documentElement).appendChild(meta);

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
      if (focusMode.value) {
        highlightSelection(focusModeColorIndex, focusModeCategory);
      } else setHighlighterPopupPosition();
    }
  });

  document.addEventListener("selectionchange", () => {
    if (getSelectedText().length === 0) {
      hideHighlighterPopup();
    }
  });
});

watch(darkMode, (newDarkModeValue) => {
  if (newDarkModeValue)
    document.documentElement.className = "uhighlight-dark-mode";
  else document.documentElement.className = "uhighlight-light-mode";
  updateHighlightColors();
});

watch(highlights, () => {
  usedCategories.value = [
    ...new Set(
      Object.values(highlights.value)
        .filter((h) => h.page === getPage.value.id)
        .map((h) => h.category)
    ),
  ];
});

async function loadData(addHighlights) {
  await store.getAllStorageData();
  const page = getPage.value;
  if (!page) {
    darkMode.value = userPrefersDarkMode();
  } else {
    darkMode.value = page.darkMode ?? userPrefersDarkMode();
    if (typeof addHighlights === "boolean" && addHighlights) {
      let error = false;
      for (const [id, highlight] of Object.entries(highlights.value)) {
        if (highlight.page === page.id) {
          try {
            const range = buildRange(highlight.rInfo);
            highlightRange(
              range,
              id,
              highlight.category,
              highlight.colorIndex,
              highlight.notes
            );
          } catch (e) {
            error = true;
            console.warn(e);
          }
        }
      }
      if (error) {
        if (page.wayback) {
          const year = +page.wayback.timestamp.substring(0, 4);
          const month = +page.wayback.timestamp.substring(4, 6);
          const day = +page.wayback.timestamp.substring(6, 8);
          if (
            confirm(
              `Some highlights failed to load, the website might have changed since the last time you visited. Do you want to switch to the wayback captured website from the ${day}.${month}.${year}?`
            )
          )
            window.open(page.wayback.url, "_blank").focus();
        } else
          alert(
            "Some highlights failed to load, the website might have changed since the last time you visited but you can still look at your highlights and notes in the popup."
          );
      }
    } else {
      updateHighlightColors();
    }
  }
}

function addCategory() {
  chrome.runtime.sendMessage({ action: "addCategory" });
}

function addNote(evt) {
  if (evt.target.closest(".uhighlight-delete-btn")) return;
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

function disabledEventPropagation(evt) {
  if (evt.stopPropagation) evt.stopPropagation();
  else if (window.event) window.event.cancelBubble = true;
}

function userPrefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function updateVisibleCategories(activeCategories) {
  for (const id of Object.keys(categories.value)) {
    let highlightElements = document.getElementsByClassName("uhighlight-" + id);
    if (activeCategories.includes(id)) {
      for (let highlight of highlightElements) {
        highlight.classList.remove("uhighlight-hidden");
      }
    } else {
      for (let highlight of highlightElements) {
        highlight.classList.add("uhighlight-hidden");
      }
    }
  }
}

function updateHighlightColors() {
  colors.value
    .map((c) => (darkMode.value ? c.dark : c.light))
    .forEach((color, index) => {
      const highlightElements = document.getElementsByClassName(
        `uhighlight-color-${index}`
      );
      for (let highlight of highlightElements) {
        highlight.style.backgroundColor = color;
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

function highlightRange(range, id, categoryId, colorIndex, notes) {
  const clone = highlightTemplate.value.cloneNode(true);
  clone.classList.add("uhighlight-" + categoryId);
  clone.classList.add("uhighlight-color-" + colorIndex);
  clone.style.backgroundColor = darkMode.value
    ? colors.value[colorIndex].dark
    : colors.value[colorIndex].light;
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
      store.saveNote(editor.getHTML(), id);
    },
  });
  input.addEventListener("click", disabledEventPropagation);
}

function deleteHighlight(evt) {
  const element = evt.target.closest(".uhighlight");
  const id = element.id.substring(11);
  //remove delete button
  element.removeChild(element.childNodes[0]);
  element.outerHTML = element.innerHTML;

  //delete from storage
  store.deleteHighlight(id);
}

function highlightSelection(colorIndex, categoryId) {
  var userSelection = window.getSelection();
  if (userSelection.toString().length === 0) return;
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
    var id = uuidv4();
    if (!usedCategories.value.find((cat) => cat === categoryId))
      usedCategories.value = [...usedCategories.value, categoryId];
    store.addHighlight(
      darkMode.value,
      id,
      userSelection.toString(),
      rInfo,
      categoryId,
      colorIndex
    );
    highlightRange(range, id, categoryId, colorIndex, null);
    removeSelection();
  }
}

function removeSelection() {
  window.getSelection().empty();
}

function changeDarkMode(newDarkModeValue) {
  darkMode.value = newDarkModeValue;
  store.saveDarkMode(darkMode.value);
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
  const sP = findEle(startTagName, startHTML);
  const eP = findEle(endTagName, endHTML);
  let s, e;
  if (startIsText) {
    const children = sP.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeType == 3 && children[i].nodeValue == startNode)
        s = children[i];
    }
  } else {
    s = sP;
  }
  if (endIsText) {
    const children = eP.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeType == 3 && children[i].nodeValue == endNode)
        e = children[i];
    }
  } else {
    e = eP;
  }
  const range = document.createRange();
  range.setStart(s, startOffset);
  range.setEnd(e, endOffset);
  return range;
}

function findEle(tagName, innerHTML) {
  const list = document.getElementsByTagName(tagName);
  for (let i = 0; i < list.length; i++) {
    if (list[i].innerHTML == innerHTML) {
      return list[i];
    }
  }
}
</script>

<style src="./content.css"></style>