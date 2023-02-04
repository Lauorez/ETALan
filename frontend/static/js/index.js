import Main from "./Main.js";
import Settings from "./Settings.js";
import Quick from "./Quick.js";
import AddQuick from "./AddQuick.js";
import DeleteQuick from "./DeleteQuick.js";

export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

export const router = async () => {
    const routes = [
        { path: "/", view: Main },
        { path: "/settings", view: Settings },
        { path: "/quick", view: Quick },
        { path: "/quick/add", view: AddQuick },
        { path: "/quick/delete", view: DeleteQuick }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    const view = new match.route.view();

    document.querySelectorAll("[data-link]").forEach(v => v.style.backgroundColor = "var(--nav-bg)")

    document.querySelector("#app").innerHTML = await view.getHtml();
    await view.register()
};
window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".nav").addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
            e.target.style.backgroundColor = "#3498db"
        }
    })
    router();
});
