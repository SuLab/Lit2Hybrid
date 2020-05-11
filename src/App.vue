<template>

  <div id="app">
     <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <app-header></app-header>
    <grid></grid>
  </div>
</template>

<script>
import Header from './components/Header'
import Grid from './components/Grid.vue'

export default {
  name: 'App',
  components: {
  "app-header" : Header,
  "grid" : Grid
  }
}
</script>

<style>


</style>
