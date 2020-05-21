window.addEventListener('DOMContentLoaded', function () {

	window.matchMedia('(prefers-color-scheme: dark)').addListener(function (event) { 
		// automatically match OS setting if no user preference is saved
		if (!localStorage.getItem('theme')) {
			app.themeSwitch = event.matches;
			document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
		}
	});

	const story = new Vue({
	'el': '#story',
	'data': {
		'text': ''
	}});

	const app = new Vue({
		'el': '#app',
		'data': {
			'themeSwitch': false,
			'content': {},
			'humorSetting': 'humorNone',
			'protagonists': [],
			'antagonists': [],
			'primaryTarget': 0,
			'secondaryTarget': 0
		},
		'created': function () {
			// light/dark theme switch
			const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

			// no localStorage, detect OS setting
			if (currentTheme === null) {
				console.log('detecting');
				if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					document.documentElement.setAttribute('data-theme', 'dark');
					this.themeSwitch = true;
				} else {
					document.documentElement.setAttribute('data-theme', 'light');
				}
			}

			// prefer localStorage preference, if present
			if (currentTheme) {
				document.documentElement.setAttribute('data-theme', currentTheme);

				if (currentTheme === 'dark') {
					this.themeSwitch = true;
				}
			}
		},
		'methods': {
			'toggleTheme': function (event) {
				if (event.target.checked) {
					document.documentElement.setAttribute('data-theme', 'dark');
					localStorage.setItem('theme', 'dark');
				} else {
					document.documentElement.setAttribute('data-theme', 'light');
					localStorage.setItem('theme', 'light');
				}
				this.themeSwitch = !this.themeSwitch;
			},
			'changeHumor': function (event) {
				const str = event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1);
				this.humorSetting = 'humor' + str;
				console.log('changed humor setting to', event.target.value);
			},
			'getHumorSetting': function () {
				return 'humor' + this.humorSetting.charAt(0).toUpperCase() + this.humorSetting.slice(1);
			},
			'changeTarget': function (type, event) {
				// console.log(type, event.target.value);
				this[type + 'Target'] = event.target.value;
			},
			'setCharacterName': function (character, index, event) {
				// reactive update to array!
				if (!this[character][index]) {
					Vue.set(this[character], index, {});
				}
				Vue.set(this[character][index], 'name', event.target.value);
				console.log('set', character, 'name to', this[character][index].name);
			},
			'randomArrayItem': function (array) {
				return array[Math.floor(Math.random() * array.length)];
			},
			'ucfirst': function (string) {
				return string.charAt(0).toUpperCase() + string.slice(1);
			},
			'niceList': function (array, filterValues=[], makeUnique=true) {
				const filtered =  array.filter(function (item) {
					return filterValues.includes(item) ? false : true;
				});

				const unique = (makeUnique) ? Array.from(new Set(filtered)) : filtered;

				return unique;
			},
			'niceListString': function (array, andWord=' and ', filterValues=[]) {
				const niceArray = this.niceList(array, filterValues);

				if (niceArray.length < 1) return '';
				if (niceArray.length === 1) return niceArray[0];

				const firstPart = niceArray.slice(0, niceArray.length-1);
				const lastPart = niceArray.slice(niceArray.length-1)

				return firstPart.join(', ') + andWord + lastPart;
			},
			'generateScreenplay': function () {
				console.log('generating screenplay script');
				// console.log(this.$refs);
				
				const humor = this.$refs['r-humor'].value;
				console.log('humor:', humor);

				const violence = this.$refs['r-violence'].options[this.$refs['r-violence'].selectedIndex].dataset.description;

				const erotica = this.$refs['r-erotica'].options[this.$refs['r-erotica'].selectedIndex].dataset.description;

				const romance = this.$refs['r-romance'].options[this.$refs['r-romance'].selectedIndex].dataset.description;

				// protagonists
				let protagonists = [];
				let p = 0;
				let protagonist = {};
				protagonist.genderData = this.content.genders[this.$refs['r-protagonists-'+p+'-gender'].value];
				protagonist.name = this.$refs['r-protagonists-'+p+'-name'].value;
				if(!protagonist.name) protagonist.name = this.randomArrayItem(this.content.protagonistValues.randomNames);

				protagonist.skill = this.$refs['r-protagonists-'+p+'-skill'].value;
				if (protagonist.skill == 'unset') protagonist.skill = protagonist.genderData.name;
				protagonist.skillDetail = this.$refs['r-protagonists-'+p+'-skill'].options[this.$refs['r-protagonists-'+p+'-skill'].selectedIndex].dataset.description;
				
				protagonist.map = this.$refs['r-protagonists-'+p+'-attributes-positive'].map(function (ele) {
					return ele.value;
				});
				protagonist.skillsPos = this.niceList(protagonist.map, ['unset']);
				protagonist.skillsPosString = this.niceListString(protagonist.skillsPos, ' und ');
				if (protagonist.skillsPosString.length < 1) protagonist.skillsPosString = 'nicht weiter definierter';

				protagonist.map = this.$refs['r-protagonists-'+p+'-attributes-negative'].map(function (ele) {
					return ele.value;
				});
				protagonist.skillsNeg = this.niceList(protagonist.map, ['unset']);
				protagonist.skillsNegString = this.niceListString(protagonist.skillsNeg, ' und ');
				if (protagonist.skillsNegString.length < 1 && protagonist.skillsPosString.length < 1) protagonist.skillsNegString = 'nicht weiter definierter';

				protagonists.push(protagonist);
				

				// antagonists
				let antagonists = [];
				p = 0;
				let antagonist = {};

				antagonist.genderData = this.content.genders[this.$refs['r-antagonists-'+p+'-gender'].value];
				antagonist.name = this.$refs['r-antagonists-'+p+'-name'].value;
				if (!antagonist.name) antagonist.name = this.randomArrayItem(this.content.antagonistValues.randomNames);

				antagonist.skill = this.$refs['r-antagonists-'+p+'-skill'];
				antagonist.job = {
					'name': this.$refs['r-antagonists-'+p+'-job'].value,
					'description': this.$refs['r-antagonists-'+p+'-job'].options[this.$refs['r-antagonists-'+p+'-job'].selectedIndex].dataset.description
				};
				
				antagonist.map = this.$refs['r-antagonists-'+p+'-attributes-positive'].map(function (ele) {
					return ele.value;
				});
				antagonist.skillsPos = this.niceList(antagonist.map, ['unset']);
				antagonist.skillsPosString = this.niceListString(antagonist.skillsPos, ' und ');
				if (antagonist.skillsPosString.length < 1) antagonist.skillsPosString = 'nicht weiter definierter';

				antagonist.map = this.$refs['r-antagonists-'+p+'-attributes-negative'].map(function (ele) {
					return ele.value;
				});
				antagonist.skillsNeg = this.niceList(antagonist.map, ['unset']);
				antagonist.skillsNegString = this.niceListString(antagonist.skillsNeg, ' und ');
				if (antagonist.skillsNegString.length < 1 && antagonist.skillsPosString.length < 1) antagonist.skillsNegString = 'nicht weiter definierter';


				antagonists.push(antagonist);
				console.log(protagonists, antagonists);

				// generate output string
				let storyString = '';

				// protagonist
				storyString += '<h2>Der Protagonist</h2>';
				storyString += '<p>' + protagonists[0].name;
				storyString += ', ' + protagonists[0].genderData.a + ' ';
				storyString += protagonists[0].skillsPosString;

				if(protagonists[0].skillsNeg.length > 0) storyString += ', aber auch ' + protagonists[0].skillsNegString;

				storyString += ' ' + protagonists[0].skill+ '.</p>';

				// antagonist
				storyString += '<h2>Der Antagonist</h2>';
				storyString += '<p>' + antagonists[0].name;
				storyString += ', ' + antagonists[0].genderData.a + ' ';
				storyString += antagonists[0].skillsPosString;

				if(antagonists[0].skillsNeg.length > 0) storyString += ', aber auch ' + antagonists[0].skillsNegString;
				storyString += ' ' + antagonists[0].job.name + '.</p>';

				storyString += '<p>' + this.ucfirst(antagonists[0].genderData.he) + ' verfügt über ';
				let tempSkills = [];
				for (let i = 0; i < antagonists[0].skill.length; i++) {
					tempSkills.push(antagonists[0].skill[i].options[antagonists[0].skill[i].selectedIndex].value);
				}
				let niceSkillString = this.niceListString(tempSkills, ' und ', ['unset']);
				storyString += (niceSkillString.length > 0) ? niceSkillString : 'keine besonderen Fähigkeiten oder Resourcen';
				storyString += '.</p>';

				// story
				const targetPrimary = this.content.targetValues[this.humorSetting][this.$refs['r-target-primary'].value].name;
				const targetSecondary = this.content.targetValues[this.humorSetting][this.$refs['r-target-primary'].value].secondaryTargets[this.$refs['r-target-secondary'].value].name;
				const targetTertiary = this.content.targetValues[this.humorSetting][this.$refs['r-target-primary'].value].secondaryTargets[this.$refs['r-target-secondary'].value].tertiaryTargets[this.$refs['r-target-tertiary'].value];

				storyString += '<h2>Die Geschichte</h2>';
				storyString += '<p>Schauplatz ist ' + targetPrimary +', '+ targetSecondary + ', und ' + targetTertiary + ' von ' + protagonists[0].name + '.</p>';

				const job = this.$refs['r-protagonist-job'].options[this.$refs['r-protagonist-job'].selectedIndex].textContent;
				const jobDesc = this.$refs['r-protagonist-job'].options[this.$refs['r-protagonist-job'].selectedIndex].dataset.description;

				const method = this.$refs['r-antagonist-method'].options[this.$refs['r-antagonist-method'].selectedIndex].textContent;
				const motiv = this.$refs['r-antagonist-motiv'].options[this.$refs['r-antagonist-motiv'].selectedIndex].textContent;

				storyString += '<p>' + this.ucfirst(protagonists[0].name) + ' und sein Team von ' + job + ' wollen '+this.ucfirst(antagonists[0].name)+' dingfest machen, da er ' + method + ' aus ' + motiv + ' verübt hat.</p>';

				storyString += '<h2>Einige Szenen (nicht chronologisch)</h2>';
				if (protagonists[0].skillDetail) storyString += '<p>' + protagonists[0].skillDetail + '</p>';
				// show random scenes here, if no others present?

				storyString += '<p>';
				let tempScenes = [];
				for (let i = 0; i < antagonists[0].skill.length; i++) {
					tempScenes.push(antagonists[0].skill[i].options[antagonists[0].skill[i].selectedIndex].dataset.description);
				}
				let niceScenes = this.niceList(tempScenes);
				storyString += (niceScenes.length > 0) ? niceScenes.join('</p><p>') : 'x';
				storyString += '</p>';


				storyString += '<h2>Gewalt, Erotik und Romantik</h2>';
				storyString += '<p>' + violence + '</p>';
				storyString += '<p>' + erotica + '</p>';
				storyString += '<p>' + romance + '</p>';

				// output
				story.text = storyString;

				story.$el.scrollIntoView({behavior: 'smooth'});
			}
		}
	});

	let movieType = 'krimi';

	fetch('./'+movieType+'.json')
		.then(response => response.json())
		.then(data => {
			app.content = data;
			console.log(app.content);
		});
});
