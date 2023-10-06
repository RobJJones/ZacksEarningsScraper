echo 'Running script ...'
cp header.csv earnings.csv; cat ./earnings/*.csv >> earnings.csv
cp header.csv revenue.csv; cat ./revenue/*.csv >> revenue.csv
echo 'Script Completed.'
