<template>
  <div id="app">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <div class="content">
      <div class="wrapper">
        <app-header class="sticky"></app-header>
        <search-form class="sticky"></search-form>
        <app-table></app-table>
      </div>
      <app-footer class="footer sticky"></app-footer>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import Table from "./components/Table";
import Footer from "./components/Footer";

export default {
  name: "App",
  components: {
    "app-header": Header,
    "search-form": SearchForm,
    "app-table": Table,
    "app-footer": Footer
  }
};
</script>

<style>
.content {
  display: inline-block;
  min-width: 100%;
}

.sticky {
  position: -webkit-sticky;
  position: sticky;
  left: 0;
  width: 100%;
  max-width: 100vw;
}

.footer {
  height: 56px;
  margin-top: 60px;
}

.wrapper {
  min-height: -moz-calc(100vh - -moz-calc(56px + 60px));
  min-height: expression(100vh - expression(56px + 60px));
  min-height: -webkit-calc(100vh - -webkit-calc(56px + 60px));
  min-height: calc(100vh - calc(56px + 60px));
}

/* bootstrap customizations */
.modal-open {
  padding-right: 0px !important;
}
</style>


