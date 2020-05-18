<template>
  <div id="app">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <search></search>
    <grid></grid>
  </div>
</template>

<script>
import Search from "./components/Search";
import Grid from "./components/Grid";

export default {
  name: "App",
  components: {
    search: Search,
    grid: Grid
  }
};
</script>

<style>
</style>
