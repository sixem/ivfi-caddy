<br/>
<p align="center">
  <img height="100" src="./icon.svg">
</p>

<br/>

<h3 align="center"><i>The image and video friendly indexer</i></h3>

<br/>

---

IVFi is a directory lister that aims to make it easy to browse web-based directories.

The Indexer is designed to look appealing while also being easy to use. It works with any type of directory, but it has a special focus on image and video files. This is reflected in the many media friendly features it has, where the most prominent ones are hoverable previews and a complete gallery view mode. 

## Features
+ :tv: Gallery mode for viewing images and videos
+ :point_left: Hoverable previews for images and videos
+ :arrow_up_down: Persistent client-set sorting settings
+ :link: Paths can be clicked, allowing for easy navigation between folders
+ :gear: The client can set their own settings in the menu
+ :small_red_triangle_down: Direct download links
+ :abc: Easy-to-use search filter
+ :book: Any `README.md` files will be shown on the top of each directory
+ :desktop_computer: Works well on both mobile and desktop

## Preview
![image](https://user-images.githubusercontent.com/2825338/203448761-571bb742-cc12-4ccc-8543-69a60010c8ce.png)

## Setup
Download the files from the latest [release](https://github.com/sixem/ivfi-caddy/releases), or build it from source yourself:
```bash
git clone https://github.com/sixem/ivfi-caddy
cd ivfi-caddy && npm install
npm run build
```
Place the files in your root web directory, for example:
```
/var/www/html/ivfi-caddy/
```
Then enable `browse` in your Caddyfile and use the theme's template:
```
browse / /var/www/html/ivfi-caddy/index.tpl
```
