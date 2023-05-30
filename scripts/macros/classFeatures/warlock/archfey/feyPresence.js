import {chris} from '../../../../helperFunctions.js';
export async function feyPresence({speaker, actor, token, character, item, args, scope, workflow}) {
    if (workflow.failedSaves.size === 0) return;
    let selection = await chris.dialog('What condition?', [['Charmed', 'Charmed'], ['Frightened', 'Frightened']]);
    if (!selection) selection = 'Charmed';
    let effectData = {
        'label': workflow.item.name,
        'icon': workflow.item.img,
        'origin': workflow.item.uuid,
        'duration': {
            'seconds': 12
        },
        'changes': [
            {
                'key': 'macro.CE',
                'mode': 0,
                'value': selection,
                'priority': 20
            }
        ],
        'flags': {
            'dae': {
                'transfer': false,
                'specialDuration': [
                    'turnEndSource'
                ],
                'stackable': 'multi',
                'macroRepeat': 'none'
            }
        }
    }
    for (let token of workflow.failedSaves) {
        await chris.createEffect(token.actor, effectData);
    }
}