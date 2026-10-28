<script>
	import favicon from '#lib/assets/favicon.svg';
	import '../app.css';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap"
		rel="stylesheet"
	/>
	<title>¿En qué año? · Trivia de videojuegos</title>
</svelte:head>

{@render children()}
