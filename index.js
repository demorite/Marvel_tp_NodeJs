#!/usr/bin/env node

const program = require('commander');
const db = require('sqlite');
const inquirer = require('inquirer');
const http = require('http');
const https = require('https');
const exec = require('child_process').exec;

const characterId = 0

program
.option("-c, --character [name]", "Select a character")

program.parse(process.argv)
if (program.character){
	start()
}
else {
	program.help()
}

function start () {
	clearPrompt()
	var name = `${program.character}`
	if (name != 'true' && name != 'false') {
		name = name.replace(/\s/g, "-");
		getCharacterId(name)
	}else {
		selectName()
	}	// body... 
}

function clearPrompt() { process.stdout.write('\033c'); }

function selectName () {
	clearPrompt()
	inquirer.prompt([
	{
		type: 'input',
		message: 'Entrer le nom de votre héro : ',
		name: 'name'
	}
	]).then((answer) => {
		var name = answer.name.replace(/\s/g, '-')
		getCharacterId(name)
	})
}

function getCharacterId (name) {
	clearPrompt()
	var url = 'https://gateway.marvel.com/v1/public/characters?limit=100&ts=1476081597&apikey=4cc7c6ce7a0bf3668b50ca382543e564&hash=6526d0eb4eab6545668ed568b282d75c&nameStartsWith='+name

	https.get(url, function(res){
		var body = '';

		res.on('data', function(chunk){
			body += chunk;
		});

		res.on('end', function(){
			var data = JSON.parse(body);
				// console.log(data.data.results)
				if (typeof(data.data) != 'undefined' && data.data.results.length > 0){
					inquirerListCharacters(data.data.results)
				}
				else {
					console.log('Aucun personnage ne porte ce nom')
				}
			});
	}).on('error', function(e){
		console.log("Got an error: ", e);
	});
}

function inquirerListCharacters (index) {
	clearPrompt()
	var characterList = []

	for (variable in index) {
		characterList.push(index[variable].name)
	}

	characterList.push('<-- Back')

	inquirer.prompt([
	{
		type: 'list',
		message: 'Select a character',
		name: 'character',
		choices: characterList
	}
	]).then((answer) => {
		if (answer.character != '<-- Back') {

			for (id in index) {

				if (answer.character == index[id].name) {

					var character_info = index[id]
					showMenu(character_info)
				}
			}
		}
		else{
			selectName()
		}
	})
}

function backMenu (character) {
	inquirer.prompt([
	{
		type: 'list',
		message: 'Sélection de personnage',
		name: 'back',
		choices: ['<-- back']
	}
	]).then((answer) => {
		showMenu(character)
	})
}

function showMenu (character) {
	clearPrompt()
	console.log(character.name, ' : \n')
	inquirer.prompt([
	{
		type: 'list',
		name: 'action',
		message: 'Que veux tu faire ?',
		choices: [
		'Afficher les comics',
		'Afficher les évènements',
		'Afficher les séries',
		new inquirer.Separator(),
		'Enregister la description dans un fichier texte'
		]
	}
	]).then(function (answers) {
		switch (answers.action) {
			case 'Afficher les comics':
				var url = 'https://gateway.marvel.com:443/v1/public/characters/'+character.id+'/comics?limit=10&orderBy=-onsaleDate&ts=1476081597&apikey=4cc7c6ce7a0bf3668b50ca382543e564&hash=6526d0eb4eab6545668ed568b282d75c'

				https.get(url, function(res){
					var body = '';

					res.on('data', function(chunk){
						body += chunk;
					});

					res.on('end', function(){
						var data = JSON.parse(body);

						data2 = data.data.results

						for (index in data2) {
							console.log(data2[index].title)
							console.log(' ')
						}
						backMenu(character)
					});
				}).on('error', function(e){
					console.log("Got an error: ", e);
				})

				break;
			case 'Afficher les évènements':

				var url = 'https://gateway.marvel.com:443/v1/public/characters/'+character.id+'/events?limit=10&orderBy=-startDate&ts=1476081597&apikey=4cc7c6ce7a0bf3668b50ca382543e564&hash=6526d0eb4eab6545668ed568b282d75c'

				https.get(url, function(res){
					var body = '';

					res.on('data', function(chunk){
						body += chunk;
					});

					res.on('end', function(){
						var data = JSON.parse(body);

						data2 = data.data.results

						for (index in data2) {
							console.log(data2[index].title)
							console.log(' ')
						}
						backMenu(character)
					});
				}).on('error', function(e){
					console.log("Got an error: ", e);
				});
				break;
			case 'Afficher les séries':

				var url = 'https://gateway.marvel.com:443/v1/public/characters/'+character.id+'/series?limit=10&orderBy=-startYear&ts=1476081597&apikey=4cc7c6ce7a0bf3668b50ca382543e564&hash=6526d0eb4eab6545668ed568b282d75c'

				https.get(url, function(res){
					var body = '';

					res.on('data', function(chunk){
						body += chunk;
					});

					res.on('end', function(){
						var data = JSON.parse(body);

						data2 = data.data.results

						for (index in data2) {
							console.log(data2[index].title)
							console.log(' ')
						}
						backMenu(character)
					});
				}).on('error', function(e){
					console.log("Got an error: ", e);
				});
				break;
			case 'Enregister la description dans un fichier texte':
				var fs = require('fs');
				var description = character.description.replace(/\. /g, ".\n")
				fs.writeFile("./"+character.name+"_description.txt", description, function(err) {
				    if(err) {
				        return console.log(err);
				    }

				    console.log("The file was saved!");
					backMenu(character)
				}); 
				break;
			default:
				// statements_def
				break;
		}
	});
}