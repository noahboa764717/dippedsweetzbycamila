const gallery = document.getElementById("galleryPreview");

if(gallery){

fetch("https://api.github.com/repos/noahboa764717/dippedsweetzbycamila/contents/gallery")

.then(res => res.json())

.then(data => {

data.slice(0,4).forEach(file => {

if(file.name.match(/\.(jpg|jpeg|png|webp)$/)){

const img = document.createElement("img");

img.src = file.download_url;

gallery.appendChild(img);

}

});

});

}
