const answerElement = document.getElementById("answer");
const updatedAtElement = document.getElementById("updated-at");
const statusPillElement = document.getElementById("status-pill");
const gifElement = document.getElementById("gif");
const gifFrameElement = document.getElementById("gif-frame");
const gifPlaceholderElement = document.getElementById("gif-placeholder");
const refreshButtonElement = document.getElementById("refresh-button");
const refreshLabelElement = document.getElementById("refresh-label");

function formatUpdatedTime(date) {
    return `Updated ${date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    })}`;
}

function preloadImage(source) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = reject;
        image.src = source;
    });
}

function setLoadingState() {
    answerElement.textContent = "Loading...";
    updatedAtElement.textContent = "Checking for a new answer.";
    statusPillElement.textContent = "Loading";
    statusPillElement.dataset.state = "loading";
    gifPlaceholderElement.textContent = "Consulting the oracle...";
    gifFrameElement.classList.add("is-loading");
    gifFrameElement.classList.remove("has-error");
    gifElement.hidden = true;
    refreshButtonElement.disabled = true;
    refreshLabelElement.textContent = "Loading...";
}

function setErrorState() {
    answerElement.textContent = "TRY AGAIN";
    updatedAtElement.textContent = "Last request failed.";
    statusPillElement.textContent = "Offline";
    statusPillElement.dataset.state = "offline";
    gifPlaceholderElement.textContent = "Unable to load a response right now.";
    gifFrameElement.classList.remove("is-loading");
    gifFrameElement.classList.add("has-error");
    gifElement.hidden = true;
}

async function getYesOrNo() {
    setLoadingState();

    try {
        const response = await fetch("https://yesno.wtf/api", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Request failed");
        }

        const data = await response.json();
        await preloadImage(data.image);

        answerElement.textContent = data.answer.toUpperCase();
        updatedAtElement.textContent = formatUpdatedTime(new Date());
        statusPillElement.textContent = "Ready";
        statusPillElement.dataset.state = "ready";
        gifElement.src = data.image;
        gifElement.alt = `Animated ${data.answer} answer`;
        gifElement.hidden = false;
        gifFrameElement.classList.remove("is-loading", "has-error");
    } catch (error) {
        setErrorState();
    } finally {
        refreshButtonElement.disabled = false;
        refreshLabelElement.textContent = "Get a New Answer";
    }
}

refreshButtonElement.addEventListener("click", getYesOrNo);
window.addEventListener("load", getYesOrNo);
