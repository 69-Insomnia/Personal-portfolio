import dns from 'node:dns';
import net from 'node:net';

dns.lookup('db.dxhkehmjuwgithhpgsxe.supabase.co', { all: true }, (err, addrs) => {
  console.log('lookup all:', err ? `ERR ${err.code}` : JSON.stringify(addrs));
});

dns.resolve6('db.dxhkehmjuwgithhpgsxe.supabase.co', (err, addrs) => {
  console.log('resolve6:', err ? `ERR ${err.code}` : addrs);
});

const socket = net.connect({ host: 'db.dxhkehmjuwgithhpgsxe.supabase.co', port: 5432, family: 6, timeout: 8000 });
socket.on('connect', () => { console.log('TCP6 5432: CONNECTED'); socket.destroy(); });
socket.on('timeout', () => { console.log('TCP6 5432: TIMEOUT'); socket.destroy(); });
socket.on('error', (e) => console.log('TCP6 5432: ERROR', e.message));

// interface check
import os from 'node:os';
console.log('IPv6 ifs:', Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv6' && !i.internal).map(i => i.address).slice(0, 4));
