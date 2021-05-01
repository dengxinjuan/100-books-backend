

DROP DATABASE IF EXISTS capstonebooks;
CREATE DATABASE capstonebooks;

\c capstonebooks;

\i schema.sql;

DROP DATABASE capstonebooks_test;
CREATE DATABASE capstonebooks_test;
\c capstonebooks_test;

\i schema.sql;

