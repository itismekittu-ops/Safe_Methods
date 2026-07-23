export const manifest = {
  screens: {
    scr_j72gez: { name: "Home", route: "/", position: { "x": 160, "y": 3800 } },
    scr_k1fn1r: { name: "Debt Management", route: "/services", position: { "x": 1560, "y": 3800 } },
    scr_wwm66q: { name: "Blog Post", route: "/blog", position: { "x": 0, "y": 0 }, isDefaultRow: true },
    scr_lc3l8a: { name: "Log In", route: "/login", state: { "activeTab": "login" }, position: { "x": 160, "y": 1820 } },
    scr_ue0mnw: { name: "Sign Up", route: "/login", state: { "activeTab": "signup" }, position: { "x": 1560, "y": 1820 } }
  },
  sections: {
    sec_cpc835: { name: "Authentication", x: 0, y: 1600, width: 2920, height: 1180 },
    sec_0ktbpn: { name: "Main App", x: 0, y: 3580, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "screen", id: "scr_wwm66q" },
  { kind: "section", id: "sec_cpc835", children: [
    { kind: "screen", id: "scr_lc3l8a" },
    { kind: "screen", id: "scr_ue0mnw" }]
  },
  { kind: "section", id: "sec_0ktbpn", children: [
    { kind: "screen", id: "scr_j72gez" },
    { kind: "screen", id: "scr_k1fn1r" }]
  }]

};