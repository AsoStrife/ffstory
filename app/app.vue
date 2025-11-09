<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script setup>
useHead({
    link: [
        { rel: 'stylesheet', href: '/css/main.css' }
    ]
})
</script>
