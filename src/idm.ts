class IDManager {
    private IDs: boolean[] = [];
    private revoked: number[] = [];

    grantID(): number {
        let id: number;
        id = this.revoked.shift() ?? this.IDs.length;
        if (id == this.IDs.length) this.IDs[this.IDs.length] = true;
        return id;
    }
    revokeID(id: number): void {
        if (delete this.IDs[id]) this.revoked.push(id);
    }
}

export default new IDManager();