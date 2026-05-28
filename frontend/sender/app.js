const dropArea = document.getElementById("drop-area")
const fileElem = document.getElementById("fileElem")

const uploadContent = document.getElementById("uploadContent")
const selectedFileBox = document.getElementById("selectedFileBox")

const fileNameText = document.getElementById("fileName")
const fileSizeText = document.getElementById("fileSize")

const changeFile = document.getElementById("changeFile")

const generateBtn = document.getElementById("generateBtn")

const uploadScreen = document.getElementById("uploadScreen")
const qrScreen = document.getElementById("qrScreen")

const qrImage = document.getElementById("qrImage")
const counterText = document.getElementById("counterText")

const controlBtn = document.getElementById("controlBtn")
const startBtn = document.getElementById("startBtn")
const stopBtn = document.getElementById("stopBtn")
const backBtn = document.getElementById("backBtn")

const specificQRBox = document.getElementById("specificQRBox")
const qrNumberInput = document.getElementById("qrNumberInput")
const showSpecificQR = document.getElementById("showSpecificQR")

let selectedFile = null

let qrList = []

let currentQR = 0

let interval = null

let isPaused = false

let speedValue = 1


// FILE SELECT

fileElem.addEventListener("change", (e) => {

    selectedFile = e.target.files[0]

    showSelectedFile()
})


// DRAG DROP

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault()
})

dropArea.addEventListener("drop", (e) => {

    e.preventDefault()

    selectedFile = e.dataTransfer.files[0]

    showSelectedFile()
})


// SHOW FILE

function showSelectedFile() {

    uploadContent.classList.add("hidden")

    selectedFileBox.classList.remove("hidden")

    dropArea.classList.add("blur")

    fileNameText.innerText = selectedFile.name

    const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2)

    fileSizeText.innerText = `${sizeMB} MB`
}


// CHANGE FILE

changeFile.addEventListener("click", () => {

    selectedFile = null

    fileElem.value = ""

    uploadContent.classList.remove("hidden")

    selectedFileBox.classList.add("hidden")

    dropArea.classList.remove("blur")
})


// GENERATE QR

generateBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select file")
        return
    }

    generateBtn.innerText = "Generating..."

    const chunkSize = document.getElementById("chunkSize").value

    const speed = document.getElementById("speed").value

    speedValue = speed

    const formData = new FormData()

    formData.append("file", selectedFile)
    formData.append("chunk_size", chunkSize)
    formData.append("speed", speed)

    const response = await fetch("https://qr-scanner-qrg7.onrender.com/generate", {
        method: "POST",
        body: formData
    })

    const data = await response.json()

    generateBtn.innerText = "Generate QR"

    qrList = data.qrs

    currentQR = 0

    uploadScreen.classList.add("hidden")

    qrScreen.classList.remove("hidden")

    specificQRBox.classList.add("hidden")

    showQR()
})


// SHOW QR

function showQR() {

    qrImage.src = `data:image/png;base64,${qrList[currentQR]}`

    counterText.innerText =
        `QR ${currentQR + 1} / ${qrList.length}`
}


let isRunning = false


// START / STOP

controlBtn.addEventListener("click", () => {

    // START

    if (!isRunning) {

        isRunning = true

        controlBtn.innerText = "Stop"

        interval = setInterval(() => {

            if (currentQR < qrList.length - 1) {

                currentQR++

                showQR()

            } else {

                clearInterval(interval)

                controlBtn.style.display = "none"

                specificQRBox.classList.remove("hidden")
            }

        }, speedValue * 1000)

    }

    // STOP

    else {

        isRunning = false

        clearInterval(interval)

        controlBtn.innerText = "Start"
    }
})


// go back

backBtn.addEventListener("click", () => {

    clearInterval(interval)

    qrScreen.classList.add("hidden")

    uploadScreen.classList.remove("hidden")

    currentQR = 0

    qrList = []

    selectedFile = null

    isRunning = false

    fileElem.value = ""

    uploadContent.classList.remove("hidden")

    selectedFileBox.classList.add("hidden")

    dropArea.classList.remove("blur")

    controlBtn.style.display = "inline-block"

    controlBtn.innerText = "Start"

    specificQRBox.classList.add("hidden")
})


// SHOW SPECIFIC QR

showSpecificQR.addEventListener("click", () => {

    const qrNumber = parseInt(qrNumberInput.value)

    if (
        qrNumber >= 1 &&
        qrNumber <= qrList.length
    ) {

        currentQR = qrNumber - 1

        showQR()

    } else {

        alert("Invalid QR Number")
    }
})
