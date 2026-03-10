const galleryFolder = "gallery/"

const imageFiles = [
"IMG_1888.jpeg",
"IMG_1889.jpeg",
"bouquet1.png",
"box1.png",
"dessertbox1.png",
"strawberry1.png",
"strawberry2.png",
"strawberry3.png"
]

const gallery = document.getElementById("gallery")

imageFiles.forEach((file,index)=>{

const img = document.createElement("img")

img.src = galleryFolder + file

img.onclick = () => openLightbox(index)

gallery.appendChild(img)

})


let currentIndex = 0

function openLightbox(index){

currentIndex = index

document.getElementById("lightbox").style.display="flex"

document.getElementById("lightbox-img").src = galleryFolder + imageFiles[index]

}

function closeLightbox(){

document.getElementById("lightbox").style.display="none"

}
