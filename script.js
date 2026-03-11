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
"gallery/1.jpg",
"gallery/2.jpg",
"gallery/3.jpg",
"gallery/4.jpg",
"gallery/5.jpg",
"gallery/6.jpg",
"gallery/7.jpg",
"gallery/8.jpg"
]

images.forEach(src=>{

const img=document.createElement("img")

img.src=src

gallery.appendChild(img)

})

}
