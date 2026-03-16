"use client";

import type { Ref } from "react";
import type { Bracket, Game, SimulatedBracket } from "@/lib/bracket-data";
import { bracketToCompressedModel } from "@/lib/bracket-to-compressed";
import { CompressedRegion } from "./CompressedRegion";
import { CompressedMatchup } from "./CompressedMatchup";
import { ConnectorCenterLine } from "./ConnectorRails";
import styles from "./compressed-bracket.module.css";

export function CompressedBracket({
  bracket,
  selectedGameId = null,
  onSelectGame,
  firstFourSectionRef,
}: {
  bracket: Bracket | SimulatedBracket;
  selectedGameId?: string | null;
  onSelectGame?: (game: Game) => void;
  /** When set, attached to the First Four block (only while First Four games are pending). */
  firstFourSectionRef?: Ref<HTMLDivElement | null>;
}) {
  const m = bracketToCompressedModel(bracket);
  const firstFourDone = m.firstFour.every((g) => g.winner != null);

  return (
    <div className={styles.bracketRoot}>
      <div className={styles.shell}>
        <div className={styles.regionPair}>
          <CompressedRegion
            data={m.south}
            side="left"
            selectedGameId={selectedGameId}
            onSelectGame={onSelectGame}
          />
          <CompressedRegion
            data={m.west}
            side="right"
            selectedGameId={selectedGameId}
            onSelectGame={onSelectGame}
          />
        </div>

        {firstFourDone ? (
          <div className={styles.centerCluster}>
            <div className={styles.centerMetaRow}>
              <div className={styles.ffColumn}>
                <div className={styles.ffLabel}>Final Four</div>
                <div className={styles.ffDate}>{m.finalFourDate}</div>
              </div>
              <div />
              <div className={styles.champColumn}>
                <div className={styles.champLabel}>Championship</div>
                <div className={styles.ffDate}>{m.championshipDate}</div>
              </div>
              <div />
              <div className={styles.ffColumn}>
                <div className={styles.ffLabel}>Final Four</div>
                <div className={styles.ffDate}>{m.finalFourDate}</div>
              </div>
            </div>

            <div className={styles.centerCardsRow}>
              <CompressedMatchup
                game={m.finalFourLeft}
                variant="center"
                className={styles.centerCard}
                selected={selectedGameId === m.finalFourLeft.id}
                onSelect={onSelectGame}
              />
              <div className={styles.centerConnector} aria-hidden>
                <ConnectorCenterLine />
              </div>
              <CompressedMatchup
                game={m.championship}
                variant="center"
                className={`${styles.centerCard} ${styles.champCard}`}
                selected={selectedGameId === m.championship.id}
                onSelect={onSelectGame}
              />
              <div className={styles.centerConnector} aria-hidden>
                <ConnectorCenterLine />
              </div>
              <CompressedMatchup
                game={m.finalFourRight}
                variant="center"
                className={styles.centerCard}
                selected={selectedGameId === m.finalFourRight.id}
                onSelect={onSelectGame}
              />
            </div>
          </div>
        ) : (
          <div
            ref={firstFourSectionRef}
            className={`${styles.centerCluster} ${styles.firstFourScrollTarget}`}
          >
            <div className={styles.firstFourHeader}>
              <div className={styles.ffLabel}>First Four</div>
              <div className={styles.ffDate}>{m.firstFourDate}</div>
            </div>
            <div className={styles.firstFourCardsRow}>
              {m.firstFour.map((game) => (
                <CompressedMatchup
                  key={game.id}
                  game={game}
                  variant="center"
                  className={styles.centerCard}
                  selected={selectedGameId === game.id}
                  onSelect={onSelectGame}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.regionPair}>
          <CompressedRegion
            data={m.east}
            side="left"
            selectedGameId={selectedGameId}
            onSelectGame={onSelectGame}
          />
          <CompressedRegion
            data={m.midwest}
            side="right"
            selectedGameId={selectedGameId}
            onSelectGame={onSelectGame}
          />
        </div>
      </div>
    </div>
  );
}
