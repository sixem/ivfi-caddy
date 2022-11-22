{{- $markdownFilePath := printf "%s/README.md" .Path -}}
{{- $totalItems := len .Items -}}

{{- $sortOrder := .Order }}
{{- $sortType := "name" }}

{{- if eq .Sort "size" -}}
	{{- $sortType = "size" -}}
{{- end -}}

{{- if eq .Sort "time" -}}
	{{- $sortType = "modified" -}}
{{- end -}}

{{- $videoExtensions := list
	"webm"
	"mp4"
	"ogv"
	"ogg"
	"mov"
-}}

{{- $imageExtensions := list
	"jpg"
	"jpeg"
	"png"
	"gif"
	"ico"
	"svg"
	"bmp"
	"webp"
-}}

{{- $dateFormat := "02/01/2006 15:04" -}}
{{- $performanceThreshold := 100 -}}
{{- $hoverPreviews := true -}}
{{- $compactMode := false -}}
{{- $encodeAll := true -}}
{{- $debug := true -}}
<!DOCTYPE HTML>
<html lang="en">
	<head>
		<meta charset='utf-8'>
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>Index of {{- html .Path -}}</title>

		<link rel="shortcut icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAbklEQVRIS2NkoDFgpLH5DPS1wCpp3X9ifHRsXhDRDkNRSKwFIEcQawnZFuDzKbLl9LWAmPAnVQ3RkUWqwTD1cAtIiWBiLIPFw6gFOENrNIgIJqTRIBqEQQRyEjWLC4xIJuhnMhXQrzQl04EEtQEArMxAGZWPy24AAAAASUVORK5CYII=" />
		<link rel="stylesheet" type="text/css" href="/CaddEye/css/style.css">

		<script defer type="text/javascript" src="/CaddEye/main.js"></script>
	</head>

	{{- $performanceMode := false -}}
	{{- if gt $totalItems $performanceThreshold -}}
		{{- $performanceMode = true -}}
	{{- end -}}
	<body class="rootDirectory{{ if eq $compactMode true }} compact{{ end }}" root{{ if eq $performanceMode true }} optimize{{ end }}>

	<div class="topBar">
		<div class="extend">⚙</div>
		<div class="directoryInfo">
			<div data-count="total">{{ $totalItems }} item{{ if ne $totalItems 1 }}s{{ end }}</div>
			<div data-count="files">{{ .NumFiles }} file{{ if ne .NumFiles 1 }}s{{end}}</div>
			<div data-count="directories">{{ .NumDirs }} director{{ if eq .NumDirs 1 }}y{{ else }}ies{{ end }}</div>
		</div>
	</div>

	<div class="path">Index of
	{{- $pathIndex := 0 }}
	{{- $pathConcentrated := "" }}
	{{- range $pathComponent := split "/" .Path -}}
		{{ if eq $pathIndex 0 }}
			<a href="/">/</a>
		{{- else -}}
			{{- $pathConcentrated = printf "%s/%s" $pathConcentrated $pathComponent -}}

			{{ $prepend := "" }}

			{{- if ne $pathIndex 1 -}}
				{{ $prepend = "/" }}
			{{- end -}}
			<a href="{{- $pathConcentrated -}}">{{- $prepend -}}{{- $pathComponent -}}</a>
		{{- end -}}

		{{ $pathIndex = add $pathIndex 1 }}
	{{- end -}}
	</div>

	{{- if (fileExists $markdownFilePath) -}}
	{{- $markdownFile := (include $markdownFilePath | splitFrontMatter) -}}
	<div class="readmeContainer">
		<div class="readmeContents">
			{{- markdown $markdownFile.Body -}}
		</div>
	</div>
	{{- end -}}

	<div class="tableContainer">
		<table>
			<thead>
				<tr>
					<th>
						<span sortable="true" title="Sort by filename">Filename</span>
						<span class="sortingIndicator"></span>
					</th>
					<th>
						<span sortable="true" title="Sort by modification date">Modified</span>
						<span class="sortingIndicator"></span>
					</th>
					<th>
						<span sortable="true" title="Sort by filesize">Size</span>
						<span class="sortingIndicator"></span>
					</th>
					<th>
						<span sortable="true" title="Sort by filetype">Type</span>
						<span class="sortingIndicator"></span>
					</th>
				</tr>
			</thead>

			<tbody>
				<tr class="parent">
					<td>
						<a href="..">[Parent Directory]</a>
					</td>

					<td><span>-</span></td>
					<td><span>-</span></td>
					<td><span>-</span></td>
				</tr>

		{{- range .Items -}}
			{{- if .IsDir -}}
				{{- $dirName := trimSuffix "/" .Name -}}
				{{- if ne $dirName "Indexer" -}}
				<tr class="directory">
					<td data-raw="{{- html .Name -}}">
						<a href="{{- html .URL -}}">[{{- $dirName -}}]</a>
					</td>

					<td data-raw="{{html .ModTime}}">
						<span>
							<span>{{- .HumanModTime $dateFormat -}}</span>
						</span>
					</td>

					<td>-</td>
					<td><span>-</span></td>
				</tr>
				{{ end }}
			{{- end }}
		{{- end }}

		{{- range .Items -}}
			{{- if not .IsDir -}}
				{{- $fileName := .Name -}}
				{{- if and (ne $fileName "README.md") (not (hasPrefix "." $fileName)) -}}
				<tr class="file">
					<td data-raw="{{html $fileName}}">
						{{- $fileNameLowered := lower $fileName -}}
						{{- $anchorClass := "" -}}
						
						{{- range $extension := $imageExtensions -}}
							{{- if hasSuffix $extension $fileNameLowered -}}
								{{- $anchorClass = "preview" -}}
								{{- break -}}
							{{- end -}}
						{{- end }}

						{{- if ne $anchorClass "preview" -}}
							{{- range $extension := $videoExtensions -}}
								{{- if hasSuffix $extension $fileNameLowered -}}
									{{- $anchorClass = "preview" -}}
									{{- break -}}
								{{- end -}}
							{{- end }}
						{{- end -}}
						<a class="{{$anchorClass}}" href="{{html .URL}}">{{- html $fileName -}}</a>
					</td>

					<td data-raw="{{.ModTime}}">
						<span>
							<span>{{- .HumanModTime $dateFormat -}}</span>
						</span>
					</td>

					<td data-raw="{{html .Size}}">{{- html .HumanSize -}}</td>

					<td data-raw="image" class="download">
						<a href="{{- html .URL -}}" download="" filename="{{html $fileName}}">
							<span>[Download]</span>
						</a>
					</td>
				</tr>
				{{ end }}
			{{- end }}
		{{- end }}

			</tbody>
		</table>
	</div>

	<div class="bottom">
		<span>Browsing <span>{{html .Path}}{{- if not (hasSuffix "/" .Path) -}}/{{- end -}}</span> ...</span>
		<div class="referenceGit">
			<a target="_blank" href="https://github.com/sixem/caddeye">CaddEye</a>
		</div>
	</div>

	<div class="filterContainer" style="display: none;">
		<input type="text" placeholder="Search .." value="">
	</div>

	<script type="text/javascript">
		function getScrollbarWidth() {
			const e = document.createElement("div");
			e.style.visibility = "hidden", e.style.overflow = "scroll", e.style.msOverflowStyle = "scrollbar", document.body.appendChild(e);
			const t = document.createElement("div");
			e.appendChild(t);
			const l = e.offsetWidth - t.offsetWidth;
			return e.parentNode.removeChild(e), l
		};
		document.documentElement.style.setProperty('--scrollbar-width', getScrollbarWidth() + 'px');
	</script>

	<script id="__INDEXER_DATA__" type="application/json">
		{
			"bust":"71b115d491918b9d50669f4a6d6274ad",
			"preview":{
			   "enabled":{{- $hoverPreviews -}},
			   "hoverDelay":75,
			   "cursorIndicator":true
			},
			"sorting":{
			   "enabled":true,
			   "types":0,
			   "sortBy":"{{- $sortType -}}",
			   "order":"{{- $sortOrder -}}"
			},
			"gallery":{
				"enabled":true,
				"reverseOptions":false,
				"scrollInterval":50,
				"listAlignment":0,
				"fitContent":true,
				"imageSharpen":false
			},
			"extensions":{
			   "image":[
			   		{{- $index := 0 -}}
			   		{{- range $extension := $imageExtensions -}}
						{{- $prepend := "" -}}

						{{- if ne $index 0 -}}
							{{- $prepend = ", " -}}
						{{- end -}}

						{{- $arrayItem := printf "%s\"%s\"" $prepend $extension -}}
						{{- $arrayItem -}}

						{{ $index = add $index 1 }}
					{{- end -}}
			   ],
			   "video":[
			   		{{- $index = 0 -}}
			   		{{- range $extension := $videoExtensions -}}
						{{- $prepend := "" -}}

						{{- if ne $index 0 -}}
							{{- $prepend = ", " -}}
						{{- end -}}

						{{- $arrayItem := printf "%s\"%s\"" $prepend $extension -}}
						{{- $arrayItem -}}

						{{ $index = add $index 1 }}
					{{- end -}}
			   ]
			},
			"format":{
			   "date":["d\/m\/y H:i"],
			   "sizes":[" B", " KiB", " MiB", " GiB", " TiB"]
			},
			"encodeAll":{{- $encodeAll -}},
			"performance":{{- $performanceMode -}},
			"debug":{{- $debug -}}
		 }
	</script>
	</body>
</html>