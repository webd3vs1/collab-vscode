
		let $sidebar = document.querySelector("#sidebar");
		let $content = document.querySelector("#content");
		let $sidebar_active = null;

		let vscode = acquireVsCodeApi();
		let url = "";

		addEventListener("message", async e => {
			let data = e.data;
			console.log(e);
			if (data.type == "icons:url") { url = data.url; }
			if (data.type == "user:profile") {
				let profile = document.createElement("div");
				profile.className = "profile";
				let avatar = new Image();
				avatar.src = data.avatar;
				let name = document.createElement("div");
				name.innerText = data.name;
				let email = document.createElement("a");
				email.href = "mailto:" + data.email;
				email.innerText = data.email;
				let site = document.createElement("a");
				site.href = data.site;
				site.innerText = data.site?.replace(/^https?:\/\//, "");
				let bio = document.createElement("div");
				bio.className = "bio";
				bio.innerText = data.bio;
				profile.appendChild(avatar);
				profile.appendChild(name);
				profile.appendChild(email);
				profile.appendChild(site);
				profile.appendChild(bio);
				$content.appendChild(profile);
				$content.classList.add("disable");
				setTimeout(() => { $content.className = ""; }, 200);
			}
			if (data.type == "user:data") {
				$sidebar.innerHTML = "";
				function click(el, message) {
					return () => {
						if ($sidebar_active) {
							$sidebar_active.classList.remove("active");
							$sidebar_active.disabled = false;
						}
						el.classList.add("active");
						$sidebar_active = el;
						el.disabled = true;
						vscode.postMessage({ type: message });
						$content.innerHTML = "";
						$content.className = "preload";
					}
				}
				let user = document.createElement("button");
				user.className = "user";
				user.innerText = "Profile";
				user.onclick = click(user, "user:profile");
				let repos = document.createElement("button");
				repos.className = "repos";
				repos.innerText = "Repositories";
				repos.onclick = click(repos, "user:repos");
				let settings = document.createElement("button");
				settings.className = "settings";
				settings.innerText = "Settings";
				$sidebar.appendChild(user);
				$sidebar.appendChild(repos);
				$sidebar.appendChild(settings);
				$sidebar.classList.add("disable");
				setTimeout(() => { $sidebar.className = ""; }, 200);
			}
			if (data.type == "user:repos") {
				let els = [];
				$content.classList.add("disable");
				setTimeout(() => { $content.className = ""; }, 200);
				data.repos.map(repo => {
					let el = document.createElement("div");
					el.className = `repo ${repo.private ? "private" : "public"}`;
					let avatar = new Image();
					avatar.src = repo.owner.avatar;
					let name = document.createElement("div");
					name.className = "name";
					let name_owner = document.createElement("a");
					name_owner.innerText = repo.owner.name;
					let name_sep = document.createElement("span");
					name_sep.innerText = "/";
					let repo_name = document.createElement("a");
					repo_name.innerText = repo_name.title = repo.name;
					name.appendChild(name_owner);
					name.appendChild(name_sep);
					name.appendChild(repo_name);
					let desc = document.createElement("div");
					desc.className = "desc";
					if (repo.description) {
						let desc_sep = document.createElement("div");
						desc_sep.className = "separator";
						let desc_cnt = document.createElement("div");
						desc_cnt.innerText = repo.description;
						desc.appendChild(desc_sep);
						desc.appendChild(desc_cnt);
					}
					let lang = document.createElement("div");
					lang.className = "lang";
					lang.innerHTML = `<img src="${icons[repo.lang]}">`;
					el.appendChild(avatar);
					el.appendChild(name);
					el.appendChild(desc);
					el.appendChild(lang);
					$content.appendChild(el);
				});
			}
		});
		let icons = (() => {
			let f = icon => { return url + "/" + icon + ".svg"; };
			let nop = () => {}; let handler = {
				get: (_0, icon) => { switch (icon) {
					case "JavaScript": return f("js");
					case "TypeScript": return f("ts");
					case "HTML": return f("html");
					case "CSS": return f("css");
					case "Nix": return f("nix");
					case "null": return f("null");
					default: {
						console.log(`\x1b[31mcollab error:\x1b[37m unknown language: ${icon}`);
						return f("unknown");
					};
				} }
			}; return new Proxy(nop, handler);
		})();