import {tashaSummon} from '../../utility/tashaSummon.js';
import {chris} from '../../helperFunctions.js';
export async function summonFiend({speaker, actor, token, character, item, args, scope, workflow}){
    let selection = await chris.dialog('What type?', [['Demon', 'Demon'], ['Devil', 'Devil'], ['Yugoloth', 'Yugoloth']]);
    if (!selection) return;
    let sourceActor = game.actors.getName('CPR - Fiendish Spirit');
    if (!sourceActor) return;
    let multiAttackFeatureData = await chris.getItemFromCompendium('chris-premades.CPR Summon Features', 'Multiattack (Fiendish Spirit)', false);
    if (!multiAttackFeatureData) return;
    multiAttackFeatureData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Multiattack (Fiendish Spirit)');
    let attacks = Math.floor(workflow.castData.castLevel / 2);
    multiAttackFeatureData.name = 'Multiattack (' + attacks + ' Attacks)';
    let magicReistanceData = await chris.getItemFromCompendium('chris-premades.CPR Summon Features', 'Magic Resistance (Fiendish Spirit)', false);
    if (!magicReistanceData) return;
    magicReistanceData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Magic Resistance (Fiendish Spirit)');
    magicReistanceData.name = 'Magic Resistance';
    let hpFormula;
    let name = 'Fiendish Spirit (' + selection + ')';
    let updates = {
        'actor': {
            'name': name,
            'system': {
                'details': {
                    'cr': tashaSummon.getCR(workflow.actor.system.attributes.prof)
                },
                'attributes': {
                    'ac': {
                        'flat': 12 + workflow.castData.castLevel
                    }
                }
            },
            'prototypeToken': {
                'name': name
            },
            'flags': {
                'chris-premades': {
                    'summon': {
                        'attackBonus': {
                            'melee': chris.getSpellMod(workflow.item) - sourceActor.system.abilities.dex.mod + Number(workflow.actor.system.bonuses.msak.attack),
                            'ranged': chris.getSpellMod(workflow.item) - sourceActor.system.abilities.dex.mod + Number(workflow.actor.system.bonuses.rsak.attack)
                        }
                    }
                }
            }
        },
        'token': {
            'name': name
        },
        'embedded': {
            'Item': {
                [multiAttackFeatureData.name]: multiAttackFeatureData,
                [magicReistanceData.name]: magicReistanceData,
                'Configure Images': warpgate.CONST.DELETE
            }
        }
    };
    let avatarImg = sourceActor.flags['chris-premades']?.summon?.image?.[selection]?.avatar;
    let tokenImg = sourceActor.flags['chris-premades']?.summon?.image?.[selection]?.token;
    if (avatarImg) updates.actor.img = avatarImg;
    if (tokenImg) {
        setProperty(updates, 'actor.prototypeToken.texture.src', tokenImg);
        setProperty(updates, 'token.texture.src', tokenImg);
    }
    switch (selection) {
        case 'Demon':
            hpFormula = 50 + ((workflow.castData.castLevel - 6) * 15);
            updates.actor.system.attributes.hp = {
                'formula': hpFormula,
                'max': hpFormula,
                'value': hpFormula
            };
            updates.actor.system.attributes.movement = {
                'walk': 40,
                'climb': 40
            };
            let deathThroesData = await chris.getItemFromCompendium('chris-premades.CPR Summon Features', 'Death Throes (Demon Only)', false);
            if (!deathThroesData) return;
            deathThroesData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Death Throes (Demon Only)');
            deathThroesData.system.save.dc = chris.getSpellDC(workflow.item);
            updates.embedded.Item[deathThroesData.name] = deathThroesData;
            let biteData = await chris.getItemFromCompendium('chris-premades.CPR Summon Features', 'Bite (Demon Only)', false);
            if (!biteData) return;
            biteData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Bite (Demon Only)');
            biteData.system.damage.parts[0][0] += ' + ' + workflow.castData.castLevel;
            updates.embedded.Item[biteData.name] = biteData;
            break;
        case 'Devil':
            hpFormula = 40 + ((workflow.castData.castLevel - 6) * 15);
            updates.actor.system.attributes.hp = {
                'formula': hpFormula,
                'max': hpFormula,
                'value': hpFormula
            };
            updates.actor.system.attributes.movement = {
                'walk': 40,
                'fly': 60
            };
            let hurlFlameData = await chris.getItemFromCompendium('chris-premades.CPR Summon Features', 'Hurl Flame (Devil Only)', false);
            if (!hurlFlameData) return;
            hurlFlameData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Hurl Flame (Devil Only)');
            hurlFlameData.system.damage.parts[0][0] += ' + ' + workflow.castData.castLevel;
            updates.embedded.Item[hurlFlameData.name] = hurlFlameData;
            let devilsSightData = await chris.getItemFromCompendium('chris-premades.CPR Summon Features', 'Devil\'s Sight (Devil Only)', false);
            if (!devilsSightData) return;
            devilsSightData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Devil\'s Sight (Devil Only)');
            updates.embedded.Item[devilsSightData.name] = devilsSightData;
            break;
        case 'Yugoloth':
            hpFormula = 60 + ((workflow.castData.castLevel - 6) * 15);
            updates.actor.system.attributes.hp = {
                'formula': hpFormula,
                'max': hpFormula,
                'value': hpFormula
            };
            let clawsData = await chris.getItemFromCompendium('chris-premades.CPR Summon Features', 'Claws (Yugoloth Only)', false);
            if (!clawsData) return;
            clawsData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Claws (Yugoloth Only)');
            clawsData.system.damage.parts[0][0] += ' + ' + workflow.castData.castLevel;
            updates.embedded.Item[clawsData.name] = clawsData;
            break;
    }
    await tashaSummon.spawn(sourceActor, updates, 3600, workflow.item);
}