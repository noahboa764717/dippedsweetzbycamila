/* FALLING STRAWBERRIES */

for(let i=0;i<12;i++){

const s=document.createElement("img")

s.src="strawberry.png"

s.className="strawberry"

s.style.left=Math.random()*100+"vw"

s.style.animationDuration=(6+Math.random()*5)+"s"

document.body.appendChild(s)

}


/* GALLERY AUTO LOAD */

const gallery=document.querySelector(".gallery-grid")

if(gallery){

const images=[
"gallery/strawberry1.png",
"gallery/strawberry2.png",
"gallery/strawberry3.png",
"gallery/dessertbox1.png",
"gallery/box1.png",
"gallery/IMG_1888.jpeg",
"gallery/IMG_1889.jpeg",
]

images.forEach(src=>{

const img=document.createElement("img")

img.src=src

gallery.appendChild(img)

})

}
