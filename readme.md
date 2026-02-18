# INSTALL
# # start new project with webpack

npm init -y
npm i webpack
nvm use 18.13.0
npm i react
npm install tailwindcss
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin
update package.json

# node version to use:
nvm use 18.13.0
launch project : npx webpack serve
or npm start

# Create table

CREATE TABLE plantes (
  id SERIAL PRIMARY KEY,
  nom_scientifique TEXT NOT NULL,
  nom_vernaculaire TEXT,
  famille TEXT,
  methode_consommation TEXT,
  proprietes_principales TEXT,
  resolution_probleme TEXT,
  parties_comestibles TEXT,
  contre_indications TEXT,
  interactions_medicamenteuses TEXT,
  contre_indication_femmes_enceintes TEXT,
  contre_indication_enfant TEXT
);


\copy plantes (
  nom_scientifique,
  nom_vernaculaire,
  famille,
  methode_consommation,
  proprietes_principales,
  resolution_probleme,
  parties_comestibles,
  contre_indications,
  interactions_medicamenteuses,
  contre_indication_femmes_enceintes,
  contre_indication_enfant
)
FROM 'data/plantes_postgres.csv'
WITH (
  FORMAT csv,
  HEADER true,
  DELIMITER ';',
  QUOTE '"',
  ESCAPE '"'
);