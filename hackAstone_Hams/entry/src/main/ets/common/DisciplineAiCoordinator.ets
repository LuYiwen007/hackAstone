/** 学科 AI 出题：仅发起请求的页面可接收结果并导航。 */
class DisciplineAiCoordinatorImpl {
  private activeOwnerId: string = '';
  private cancelled: boolean = false;

  begin(ownerId: string): void {
    this.activeOwnerId = ownerId;
    this.cancelled = false;
  }

  cancel(ownerId: string): void {
    if (this.activeOwnerId === ownerId) {
      this.cancelled = true;
      this.activeOwnerId = '';
    }
  }

  shouldAccept(ownerId: string): boolean {
    return this.activeOwnerId === ownerId && !this.cancelled;
  }

  finish(ownerId: string): boolean {
    if (!this.shouldAccept(ownerId)) {
      return false;
    }
    this.activeOwnerId = '';
    return true;
  }
}

export const disciplineAiCoordinator: DisciplineAiCoordinatorImpl = new DisciplineAiCoordinatorImpl();
