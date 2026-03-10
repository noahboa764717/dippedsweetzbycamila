const username = "noahboa764717"
const repo = "dippedsweetzbycamila"
const folder = "gallery"

const gallery = document.getElementById("gallery")

const apiURL = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`

let images = []
let currentIndex = 0

fetch(apiURL)
.then(res => res.json())
.then(data => {

data.forEach((file,index)=>{

if(file.type === "file"){

const img = document.createElement("img")

img.src = file.download_url

img.onclick = () => openLightbox(index)

gallery.appendChild(img)

images.push(file.download_url)

}

})

})

function openLightbox(index){

currentIndex = index

document.getElementById("lightbox").style.display="flex"

document.getElementById("lightbox-img").src = images[index]

}

function closeLightbox(){

document.getElementById("lightbox").style.display="none"

}

function nextImage(){

currentIndex = (currentIndex + 1) % images.length

document.getElementById("lightbox-img").src = images[currentIndex]

}

function prevImage(){

currentIndex = (currentIndex - 1 + images.length) % images.length

document.getElementById("lightbox-img").src = images[currentIndex]

}
