#!/bin/bash

echo "Syncing shared code to all apps..."
echo ""

apps=("employee" "admin" "maintenance" "college-dean" "president" "deployment-office" "driver")

for app in "${apps[@]}"
do
  echo "Syncing to $app..."
  cp -r shared/* apps/$app/shared/
done

echo ""
echo "✓ Shared code synced to all apps!"
