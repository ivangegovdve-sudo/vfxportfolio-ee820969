# Manual asset step (intentionally not committed)

This repository references these runtime image URLs:

- `/assets/slackPic.png`
- `/assets/natGeoExplorerAcademy.png`
- `/assets/RescueHeroes.png`
- `/assets/miro_end.png`
- `/assets/AuthRights.png`

To keep pull requests binary-free, copy these files manually before publishing:

```bash
mkdir -p public/assets
cp src/data/assets/slackPic.png public/assets/slackPic.png
cp src/data/assets/natGeoExplorerAcademy.png public/assets/natGeoExplorerAcademy.png
cp src/data/assets/RescueHeroes.png public/assets/RescueHeroes.png
cp src/data/assets/miro_end.png public/assets/miro_end.png
cp src/data/assets/AuthRights.png public/assets/AuthRights.png
```

After copying, deploy as usual.
