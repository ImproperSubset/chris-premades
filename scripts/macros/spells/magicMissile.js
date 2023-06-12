import {chris} from '../../helperFunctions.js';
export async function magicMissile({speaker, actor, token, character, item, args, scope, workflow}) {
    if (workflow.targets.size === 0) return;
    let maxMissiles = 3 + (workflow.castData.castLevel - 1);
    let buttons = [
        {
            'label': 'Ok',
            'value': true
        }, {
            'label': 'Cancel',
            'value': false
        }
    ];
    let targets = Array.from(workflow.targets);
    let selection = await chris.selectTarget('How many? (Max: ' + maxMissiles + ')', buttons, targets, true, 'number');
    if (!selection.buttons) return;
    let total = 0;
    for (let i of selection.inputs) {
        if (!isNaN(i)) total += i;
    }
    if (total > maxMissiles) {
        ui.notifications.info('You can\'t use that many missiles!');
        return;
    }
    let featureData = await chris.getItemFromCompendium('chris-premades.CPR Spell Features', 'Magic Missile Bolt', false);
    if (!featureData) return;
    featureData.system.description.value = chris.getItemDescription('CPR - Descriptions', 'Magic Missile Bolt');
    featureData.flags['chris-premades'] = {
        'spell': {
            'castData': workflow.castData
        }
    }
    featureData.flags['chris-premades'].spell.castData.school = workflow.item.system.school;
    delete featureData._id;
    if (game.settings.get('chris-premades', 'Magic Missile Toggle')) {
        let damageRoll = await new Roll('1d4[force] + 1').roll({async: true});
        damageRoll.toMessage({
            rollMode: 'roll',
            speaker: {alias: name},
            flavor: workflow.item.name
        });
        featureData.system.damage.parts = [
            [
                damageRoll.total + '[force]',
                'force'
            ]
        ];
    }
    let feature = new CONFIG.Item.documentClass(featureData, {parent: workflow.actor});
    let options = {
        'showFullCard': false,
        'createWorkflow': true,
        'targetUuids': [],
        'configureDialog': false,
        'versatile': false,
        'consumeResource': false,
        'consumeSlot': false
    };
    for (let i = 0; i < selection.inputs.length; i++) {
        if (isNaN(selection.inputs[i]) || selection.inputs[i] === 0) continue;
        options.targetUuids = [targets[i].document.uuid];
        new Sequence().effect().file('jb2a.magic_missile.purple').atLocation(workflow.token).stretchTo(targets[i]).repeats(selection.inputs[i], 200, 200).randomizeMirrorY().play();
        for (let j = 0; j < selection.inputs[i]; j++) {
            await MidiQOL.completeItemUse(feature, {}, options);
        }
    }
}