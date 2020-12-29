select *
from temperatures

limit 10

select *
from temperatures
where date between 1500118900 and 1500118960

--alter table temperatures
--add column precision integer

--update temperatures
--set precision = 0

--create table test
--(test integer not null)



select count(*) from temperatures where date > 1609215015 and thermometerId = 15;