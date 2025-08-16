import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const FILE = path.join( os.homedir(), '.vscord-session.json' );

export function loadTotalTime(): number
{
    if( !fs.existsSync( FILE ) )
        return 0;

    try
    {
        const { totalTime } = JSON.parse( fs.readFileSync( FILE, 'utf8' ) );
        return typeof totalTime === 'number' ? totalTime : 0;
    }
    catch
    {
        return 0;
    }
}

export function saveTotalTime( totalSeconds: number )
{
    fs.writeFileSync( FILE, JSON.stringify( { totalTime: totalSeconds } ), 'utf8' );
}
