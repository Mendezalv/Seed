from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class MergeResult:
    resolved: bool
    winning_data: Optional[Dict[str, Any]]
    conflict_details: Optional[Dict[str, Any]]
    requires_review: bool = False

class MergeStrategy(ABC):
    @abstractmethod
    async def resolve(self, local: Dict[str, Any], remote: Dict[str, Any], operation: Any) -> MergeResult:
        pass

class LastWriteWins(MergeStrategy):
    async def resolve(self, local: Dict[str, Any], remote: Dict[str, Any], operation: Any) -> MergeResult:
        local_ts = local.get('updated_at')
        remote_ts = remote.get('updated_at', operation.timestamp)
        
        if local_ts and remote_ts:
            if remote_ts > local_ts:
                return MergeResult(resolved=True, winning_data=remote, conflict_details=None)
            elif remote_ts < local_ts:
                return MergeResult(resolved=True, winning_data=local, conflict_details=None)
            else:
                return MergeResult(resolved=True, winning_data=remote, conflict_details=None)
        
        return MergeResult(resolved=True, winning_data=remote, conflict_details=None)

class CRDTGCounter(MergeStrategy):
    async def resolve(self, local: Dict[str, Any], remote: Dict[str, Any], operation: Any) -> MergeResult:
        local_counts = local.get('counts', {})
        remote_counts = remote.get('counts', {})
        
        merged_counts = {}
        all_devices = set(local_counts.keys()).union(set(remote_counts.keys()))
        for device in all_devices:
            merged_counts[device] = max(local_counts.get(device, 0), remote_counts.get(device, 0))
            
        merged_data = {'counts': merged_counts, 'total': sum(merged_counts.values())}
        return MergeResult(resolved=True, winning_data=merged_data, conflict_details=None)

class ManualReview(MergeStrategy):
    async def resolve(self, local: Dict[str, Any], remote: Dict[str, Any], operation: Any) -> MergeResult:
        return MergeResult(
            resolved=False,
            winning_data=None,
            conflict_details={'local': local, 'remote': remote},
            requires_review=True
        )
