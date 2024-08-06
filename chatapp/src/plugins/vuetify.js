import "vuetify/styles"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

const customTheme = {
  colors: {
    primary: "#4caf50",
    secondary: "#8bc34a",
    accent: "#cddc39",
    error: "#ffeb3b",
    warning: "#ffc107",
    info: "#ff5722",
    success: "#795548",
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "customTheme",
    themes: { customTheme }
  },
})