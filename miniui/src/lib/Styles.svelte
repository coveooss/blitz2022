<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Arima+Madurai:wght@100;200;300;400;500;700;800;900&family=Cinzel+Decorative:wght@400;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<style>
	:global(:root) {
		/* Decided by shrinking it until a "square" map can be seen vertically */
		--maximum-blitz-width: 1500px;

		--player-1-color: #ff5757;
		--player-2-color: #8eb3ff;
		--player-3-color: #aef4a7;
		--player-4-color: #fdb529;

		--diamond-level-1-color: rgba(161, 1, 216, 0.74);
		--diamond-level-2-color: rgba(205, 33, 19, 0.75);
		--diamond-level-3-color: rgba(217, 169, 2, 0.7);
		--diamond-level-4-color: rgba(0, 172, 38, 0.59);
		--diamond-level-5-color: rgba(7, 121, 255, 0.53);
		--jewel-turquoise: #27d9db;

		--blitz-background-color: #011011;
		--blitz-background-color-transparent: rgb(1, 16, 17, 0.9);
		--blitz-golden: #d8c090;
		--blitz-golden-transparent: rgba(216, 192, 144, 0.4);

		--default-font-family:  Arima Madurai;
		--title-font-family: Cinzel Decorative, cursive;
	}

	:global(body) {
		color: white;
		background-color: black;

        font-family: var(--default-font-family);
	}

	:global(section + section) {
		margin-top: 32px;
	}

	:global(.blitz-input) {
		background-color: var(--blitz-background-color);
		color: var(--blitz-golden-transparent);
		padding: 15px;
		padding-right: 5px;
		border: none;
		border-bottom: 1px solid var(--blitz-golden-transparent);
	}

	:global(.blitz-button) {
		box-sizing: border-box;
		background-color: var(--blitz-background-color);
		color: var(--blitz-golden);
		padding: 10px;
		border: 1px solid var(--blitz-golden);
		font-family: var(--default-font-family);
		cursor: pointer;
		transition: background-color 0.2s;
	}

	:global(.blitz-button:hover) {
		background-color: var(--blitz-golden-transparent);
	}

	:global(.text-golden) {
		color: var(--blitz-golden);
	}

    :global(.title) {
        font-family: Cinzel Decorative, cursive;
        font-weight: normal;
    }

	:global(.text-player-1) {
		color: var(--player-1-color);
	}
	:global(.text-player-2) {
		color: var(--player-2-color);
	}
	:global(.text-player-3) {
		color: var(--player-3-color);
	}
	:global(.text-player-4) {
		color: var(--player-4-color);
	}

  /* animal-1, animal-2, animal-3, animal-4 are fallback for unit > 4*/
  :global(.animal-1) {
      background-image: url('/characters/Animal=Crocodile, Color=Red, Summon=No.png');
  }
  :global(.animal-2) {
      background-image: url('/characters/Animal=Crocodile, Color=Blue, Summon=No.png');
  }
  :global(.animal-3) {
      background-image: url('/characters/Animal=Crocodile, Color=Green, Summon=No.png');
  }
  :global(.animal-4) {
      background-image: url('/characters/Animal=Crocodile, Color=Orange, Summon=No.png');
  }
  :global(.animal-1-summon) {
      background-image: url('/characters/Animal=Crocodile, Color=Red, Summon=Yes.png');
  }
  :global(.animal-2-summon) {
      background-image: url('/characters/Animal=Crocodile, Color=Blue, Summon=Yes.png');
  }
  :global(.animal-3-summon) {
      background-image: url('/characters/Animal=Crocodile, Color=Green, Summon=Yes.png');
  }
  :global(.animal-4-summon) {
      background-image: url('/characters/Animal=Crocodile, Color=Orange, Summon=Yes.png');
  }

	/* Un peu boboche... mais ça marche */
	:global(.animal-1-1) {
		background-image: url('/characters/Animal=Crocodile, Color=Red, Summon=No.png');
	}
	:global(.animal-1-2) {
		background-image: url('/characters/Animal=Eagle, Color=Red, Summon=No.png');
	}
	:global(.animal-1-3) {
		background-image: url('/characters/Animal=Jaguar, Color=Red, Summon=No.png');
	}
	:global(.animal-1-4) {
		background-image: url('/characters/Animal=Snake, Color=Red, Summon=No.png');
	}
	:global(.animal-2-1) {
		background-image: url('/characters/Animal=Crocodile, Color=Blue, Summon=No.png');
	}
	:global(.animal-2-2) {
		background-image: url('/characters/Animal=Eagle, Color=Blue, Summon=No.png');
	}
	:global(.animal-2-3) {
		background-image: url('/characters/Animal=Jaguar, Color=Blue, Summon=No.png');
	}
	:global(.animal-2-4) {
		background-image: url('/characters/Animal=Snake, Color=Blue, Summon=No.png');
	}
	:global(.animal-3-1) {
		background-image: url('/characters/Animal=Crocodile, Color=Green, Summon=No.png');
	}
	:global(.animal-3-2) {
		background-image: url('/characters/Animal=Eagle, Color=Green, Summon=No.png');
	}
	:global(.animal-3-3) {
		background-image: url('/characters/Animal=Jaguar, Color=Green, Summon=No.png');
	}
	:global(.animal-3-4) {
		background-image: url('/characters/Animal=Snake, Color=Green, Summon=No.png');
	}
	:global(.animal-4-1) {
		background-image: url('/characters/Animal=Crocodile, Color=Orange, Summon=No.png');
	}
	:global(.animal-4-2) {
		background-image: url('/characters/Animal=Eagle, Color=Orange, Summon=No.png');
	}
	:global(.animal-4-3) {
		background-image: url('/characters/Animal=Jaguar, Color=Orange, Summon=No.png');
	}
	:global(.animal-4-4) {
		background-image: url('/characters/Animal=Snake, Color=Orange, Summon=No.png');
	}
	:global(.animal-1-1-summon) {
		background-image: url('/characters/Animal=Crocodile, Color=Red, Summon=Yes.png');
	}
	:global(.animal-1-2-summon) {
		background-image: url('/characters/Animal=Eagle, Color=Red, Summon=Yes.png');
	}
	:global(.animal-1-3-summon) {
		background-image: url('/characters/Animal=Jaguar, Color=Red, Summon=Yes.png');
	}
	:global(.animal-1-4-summon) {
		background-image: url('/characters/Animal=Snake, Color=Red, Summon=Yes.png');
	}
	:global(.animal-2-1-summon) {
		background-image: url('/characters/Animal=Crocodile, Color=Blue, Summon=Yes.png');
	}
	:global(.animal-2-2-summon) {
		background-image: url('/characters/Animal=Eagle, Color=Blue, Summon=Yes.png');
	}
	:global(.animal-2-3-summon) {
		background-image: url('/characters/Animal=Jaguar, Color=Blue, Summon=Yes.png');
	}
	:global(.animal-2-4-summon) {
		background-image: url('/characters/Animal=Snake, Color=Blue, Summon=Yes.png');
	}
	:global(.animal-3-1-summon) {
		background-image: url('/characters/Animal=Crocodile, Color=Green, Summon=Yes.png');
	}
	:global(.animal-3-2-summon) {
		background-image: url('/characters/Animal=Eagle, Color=Green, Summon=Yes.png');
	}
	:global(.animal-3-3-summon) {
		background-image: url('/characters/Animal=Jaguar, Color=Green, Summon=Yes.png');
	}
	:global(.animal-3-4-summon) {
		background-image: url('/characters/Animal=Snake, Color=Green, Summon=Yes.png');
	}
	:global(.animal-4-1-summon) {
		background-image: url('/characters/Animal=Crocodile, Color=Orange, Summon=Yes.png');
	}
	:global(.animal-4-2-summon) {
		background-image: url('/characters/Animal=Eagle, Color=Orange, Summon=Yes.png');
	}
	:global(.animal-4-3-summon) {
		background-image: url('/characters/Animal=Jaguar, Color=Orange, Summon=Yes.png');
	}
	:global(.animal-4-4-summon) {
		background-image: url('/characters/Animal=Snake, Color=Orange, Summon=Yes.png');
	}

	:global(.diamond-1-1) {
		background-image: url('/diamonds/Level=1, Diamond=XS.png');
	}
	:global(.diamond-1-2) {
		background-image: url('/diamonds/Level=1, Diamond=S.png');
	}
	:global(.diamond-1-3) {
		background-image: url('/diamonds/Level=1, Diamond=M.png');
	}
	:global(.diamond-1-4) {
		background-image: url('/diamonds/Level=1, Diamond=L.png');
	}
	:global(.diamond-1-5) {
		background-image: url('/diamonds/Level=1, Diamond=XL.png');
	}
	:global(.diamond-2-1) {
		background-image: url('/diamonds/Level=2, Diamond=XS.png');
	}
	:global(.diamond-2-2) {
		background-image: url('/diamonds/Level=2, Diamond=S.png');
	}
	:global(.diamond-2-3) {
		background-image: url('/diamonds/Level=2, Diamond=M.png');
	}
	:global(.diamond-2-4) {
		background-image: url('/diamonds/Level=2, Diamond=L.png');
	}
	:global(.diamond-2-5) {
		background-image: url('/diamonds/Level=2, Diamond=XL.png');
	}
	:global(.diamond-3-1) {
		background-image: url('/diamonds/Level=3, Diamond=XS.png');
	}
	:global(.diamond-3-2) {
		background-image: url('/diamonds/Level=3, Diamond=S.png');
	}
	:global(.diamond-3-3) {
		background-image: url('/diamonds/Level=3, Diamond=M.png');
	}
	:global(.diamond-3-4) {
		background-image: url('/diamonds/Level=3, Diamond=L.png');
	}
	:global(.diamond-3-5) {
		background-image: url('/diamonds/Level=3, Diamond=XL.png');
	}
	:global(.diamond-4-1) {
		background-image: url('/diamonds/Level=4, Diamond=XS.png');
	}
	:global(.diamond-4-2) {
		background-image: url('/diamonds/Level=4, Diamond=S.png');
	}
	:global(.diamond-4-3) {
		background-image: url('/diamonds/Level=4, Diamond=M.png');
	}
	:global(.diamond-4-4) {
		background-image: url('/diamonds/Level=4, Diamond=L.png');
	}
	:global(.diamond-4-5) {
		background-image: url('/diamonds/Level=4, Diamond=XL.png');
	}
	:global(.diamond-5-1) {
		background-image: url('/diamonds/Level=5, Diamond=XS.png');
	}
	:global(.diamond-5-2) {
		background-image: url('/diamonds/Level=5, Diamond=S.png');
	}
	:global(.diamond-5-3) {
		background-image: url('/diamonds/Level=5, Diamond=M.png');
	}
	:global(.diamond-5-4) {
		background-image: url('/diamonds/Level=5, Diamond=L.png');
	}
	:global(.diamond-5-5) {
		background-image: url('/diamonds/Level=5, Diamond=XL.png');
	}

	/*
		See ViewerTiles enum for values.
	 	FLOOR = 0,
		SPAWN = 1,
		DIAMOND = 2,
		WATERWALL = 3,
		STONEWALL = 4,
		TRAP = 5,
	*/
	:global(.background-tile-0),
	:global(.background-tile-2) {
		background-image: url('/tileset/Floor (Terrain).png');
	}
	:global(.background-tile-1) {
		background-image: url('/tileset/Vegetation (Terrain).png');
	}
	:global(.background-tile-3) {
		background-image: url('/tileset/Water (Wall).png');
	}
	:global(.background-tile-4) {
		background-image: url('/tileset/Stone Wall (Wall).png');
	}
	:global(.background-tile-5) {
		background-image: url('/tileset/Trap (Terrain).png');
	}
</style>
