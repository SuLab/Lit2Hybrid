<template>
  <div class="footer bg-light">
    <span class="footer-items">
      <b-link href="http://sulab.org/" target="_blank">The Su Lab</b-link>
      <a href="https://github.com/SuLab/Lit2Hybrid" target="_blank">GitHub</a>
    </span>
  </div>
</template>

<script>
export default {
  name: "Footer"
};
</script>

<style>
.footer {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
}

.footer-items {
  display: inline;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
}

.footer-items a {
  margin-right: 2rem;
  color: rgba(0, 0, 0, 0.9);
}
</style>  