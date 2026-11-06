import { BlockList, isIPv4, isIPv6 } from 'node:net';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';


const LIST_BASE = 'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output';
const LISTS = [
    { path: 'datacenter/ipv4.txt', type: 'ipv4' },
    { path: 'vpn/ipv4.txt', type: 'ipv4' },
    { path: 'datacenter/ipv6.txt', type: 'ipv6' },
] as const;
const REFRESH_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class IpReputationService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(IpReputationService.name);
    private blockList: BlockList | null = null;
    private timer?: NodeJS.Timeout;

    onModuleInit() {
        void this.refresh();
        this.timer = setInterval(() => void this.refresh(), REFRESH_MS);
        this.timer.unref();
    }

    onModuleDestroy() {
        clearInterval(this.timer);
    }

    isHostingOrVpn(ip: string | undefined) {
        if (!ip || !this.blockList) return false;
        const address = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
        if (isIPv4(address)) return this.blockList.check(address, 'ipv4');
        if (isIPv6(address)) return this.blockList.check(address, 'ipv6');
        return false;
    }

    private async refresh() {
        try {
            const next = new BlockList();
            let count = 0;
            for (const list of LISTS) {
                const res = await fetch(`${LIST_BASE}/${list.path}`, { signal: AbortSignal.timeout(15_000) });

                if (!res.ok) throw new Error(`${list.path}: HTTP ${res.status}`);

                for (const line of (await res.text()).split('\n')) {
                    const [network, prefix] = line.trim().split('/');
                    if (!network || !prefix) continue;
                    next.addSubnet(network, Number(prefix), list.type);
                    count++;
                }
            }
            this.blockList = next;
            this.logger.log(`Loaded ${count} datacenter/VPN ranges`);
        } catch (error) {
            this.logger.warn(`IP list refresh failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
