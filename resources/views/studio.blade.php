<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}"><meta name="theme-color" content="#07111d">
<meta name="description" content="Pixode designs and builds purposeful websites, apps and online stores.">
<title>Pixode   Thoughtfully designed. Carefully built.</title>
<link rel="icon" href="{{ asset('assets/pixode-logo.png') }}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;550;600;650;700&family=Manrope:wght@400;500;600;650;700;750;800&display=swap" rel="stylesheet">
@php
$dev = app()->environment('local') && is_file(public_path('hot'));
$manifestPath = public_path('build/.vite/manifest.json');
$manifest = is_file($manifestPath) ? json_decode(file_get_contents($manifestPath), true) : [];
$entry = $manifest['resources/js/studio/main.jsx'] ?? null;
@endphp
@if($dev)
<script type="module">
import RefreshRuntime from 'http://127.0.0.1:5173/build/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
</script>
<script type="module" src="http://127.0.0.1:5173/build/@vite/client"></script>
<script type="module" src="http://127.0.0.1:5173/build/resources/js/studio/main.jsx"></script>
@elseif($entry)
@foreach($entry['css'] ?? [] as $css)<link rel="stylesheet" href="{{ asset('build/'.$css) }}">@endforeach
<script type="module" src="{{ asset('build/'.$entry['file']) }}"></script>
@endif
</head>
<body><div id="root">@unless($entry || $dev)<p>Run npm run build to prepare the Pixode website.</p>@endunless</div></body>
</html>